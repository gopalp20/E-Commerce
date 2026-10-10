const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Writable } = require("node:stream");
const { v2: cloudinary } = require("cloudinary");
const storage = require("../services/cloudinaryStorage");

function configure(t) {
  const values = {
    CLOUDINARY_CLOUD_NAME: "forme-test",
    CLOUDINARY_API_KEY: "12345",
    CLOUDINARY_API_SECRET: "test-secret-do-not-expose",
  };
  const original = Object.fromEntries(
    Object.keys(values).map((key) => [key, process.env[key]]),
  );
  Object.assign(process.env, values);
  t.after(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

test("Cloudinary requires complete private configuration without echoing credentials", () => {
  for (const env of [
    {},
    { CLOUDINARY_CLOUD_NAME: "forme-test", CLOUDINARY_API_SECRET: "private" },
    {
      CLOUDINARY_CLOUD_NAME: "your_cloud_name",
      CLOUDINARY_API_KEY: "123",
      CLOUDINARY_API_SECRET: "private",
    },
  ]) {
    assert.throws(
      () => storage.cloudinaryConfig(env),
      (error) => {
        assert.equal(error.statusCode, 503);
        assert.equal(error.expose, true);
        assert.doesNotMatch(error.message, /private/);
        return true;
      },
    );
  }
});

test("Cloudinary upload uses signed server credentials, unique immutable IDs and HTTPS delivery", async (t) => {
  configure(t);
  const data = Buffer.from("already-validated-webp");
  const expected = "forme/products/42/photo-id";
  t.mock.method(cloudinary.uploader, "upload_stream", (options, callback) => {
    assert.equal(options.public_id, expected);
    assert.equal(options.overwrite, false);
    assert.equal(options.resource_type, "image");
    assert.equal(options.format, "webp");
    assert.equal(options.timeout, 20000);
    assert.equal(options.api_secret, process.env.CLOUDINARY_API_SECRET);
    return new Writable({
      write(chunk, _, next) {
        assert.deepEqual(chunk, data);
        next();
        callback(null, {
          public_id: expected,
          secure_url: `https://res.cloudinary.com/forme-test/image/upload/v1/${expected}.webp`,
        });
      },
    });
  });
  const uploaded = await storage.uploadProductImage(data, {
    id: "photo-id",
    ownerId: 42,
  });
  assert.equal(uploaded.cloudinaryPublicId, expected);
  assert.match(uploaded.cloudinaryUrl, /^https:/);
  assert.equal(JSON.stringify(uploaded).includes("test-secret"), false);
});

test("Cloudinary provider and stream failures become safe retryable errors", async (t) => {
  configure(t);
  for (const viaStream of [false, true]) {
    const stub = t.mock.method(
      cloudinary.uploader,
      "upload_stream",
      (_, callback) =>
        new Writable({
          write(chunk, encoding, next) {
            const error = new Error(
              "request included test-secret-do-not-expose",
            );
            if (viaStream) next(error);
            else {
              next();
              callback(error);
            }
          },
        }),
    );
    await assert.rejects(
      storage.uploadProductImage(Buffer.from("photo"), {
        id: "failed",
        ownerId: 42,
      }),
      (error) => {
        assert.equal(error.statusCode, 502);
        assert.equal(error.expose, true);
        assert.doesNotMatch(error.message, /test-secret/);
        return true;
      },
    );
    stub.mock.restore();
  }
});

test("Untrusted delivery results are rejected and the generated asset is cleaned up", async (t) => {
  configure(t);
  const destroyed = [];
  t.mock.method(cloudinary.uploader, "destroy", async (id, options) => {
    destroyed.push(id);
    assert.equal(options.invalidate, true);
    return { result: "ok" };
  });
  t.mock.method(
    cloudinary.uploader,
    "upload_stream",
    (_, callback) =>
      new Writable({
        write(chunk, encoding, next) {
          next();
          callback(null, {
            public_id: "forme/products/42/bad",
            secure_url: "https://attacker.test/photo.webp",
          });
        },
      }),
  );
  await assert.rejects(
    storage.uploadProductImage(Buffer.from("photo"), {
      id: "bad",
      ownerId: 42,
    }),
    { statusCode: 502 },
  );
  assert.deepEqual(destroyed, ["forme/products/42/bad"]);
  for (const url of [
    "http://res.cloudinary.com/a/image/upload/b",
    "https://res.cloudinary.com.attacker.test/a/image/upload/b",
    "https://user:secret@res.cloudinary.com/a/image/upload/b",
    "https://res.cloudinary.com/a/raw/upload/b",
    "https://res.cloudinary.com/undefined/image/upload/b",
  ]) {
    assert.equal(storage.isCloudinaryImageUrl(url, "forme-test"), false);
  }
});

test("Cleanup failure preserves the original failure and logs only the generated ID", async (t) => {
  configure(t);
  const logs = [];
  t.mock.method(console, "error", (message) => logs.push(message));
  t.mock.method(cloudinary.uploader, "destroy", async () => {
    throw new Error(process.env.CLOUDINARY_API_SECRET);
  });
  assert.equal(
    await storage.removeProductImage("forme/products/42/orphan"),
    false,
  );
  assert.equal(logs.length, 1);
  assert.match(logs[0], /forme\/products\/42\/orphan/);
  assert.doesNotMatch(logs[0], /test-secret/);
});
