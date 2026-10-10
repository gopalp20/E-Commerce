const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { tmpdir } = require("node:os");
const { randomUUID } = require("node:crypto");
const storage = require("../services/cloudinaryStorage");
const { migrateLocalImage } = require("../services/migrateLocalMedia");

async function fixture(t) {
  const directory = await fs.mkdtemp(
    path.join(tmpdir(), "forme-media-migration-"),
  );
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const id = randomUUID(),
    filename = `${id}.webp`;
  await fs.writeFile(path.join(directory, filename), "legacy-photo");
  return {
    directory,
    file: path.join(directory, filename),
    asset: {
      id,
      url: `/api/media/images/${filename}`,
      ownerId: 42,
      cloudinaryUrl: null,
    },
  };
}

test("Legacy migration ignores cloud assets, missing files and paths outside its directory", async (t) => {
  const { directory, asset, file } = await fixture(t);
  const upload = t.mock.method(storage, "uploadProductImage", () => {
    throw new Error("Unexpected upload");
  });
  const options = { directory, prisma: {} };
  assert.equal(
    await migrateLocalImage(
      {
        ...asset,
        cloudinaryUrl: "https://res.cloudinary.com/demo/image/upload/photo",
      },
      options,
    ),
    "already-cloud",
  );
  assert.equal(
    await migrateLocalImage(
      { ...asset, url: "/api/media/images/../../.env" },
      options,
    ),
    "not-local",
  );
  await fs.unlink(file);
  assert.equal(await migrateLocalImage(asset, options), "missing-file");
  await fs.symlink(path.join(directory, "private"), file);
  assert.equal(await migrateLocalImage(asset, options), "invalid-file");
  assert.equal(upload.mock.callCount(), 0);
});

test("Failed database updates clean up the cloud copy and retain the original file", async (t) => {
  const { directory, asset, file } = await fixture(t);
  const cloud = {
    cloudinaryPublicId: "forme/products/42/new-copy",
    cloudinaryUrl: "https://res.cloudinary.com/demo/image/upload/copy.webp",
  };
  t.mock.method(storage, "uploadProductImage", async () => cloud);
  const removed = [];
  t.mock.method(storage, "removeProductImage", async (id) => removed.push(id));
  await assert.rejects(
    migrateLocalImage(asset, {
      directory,
      prisma: {
        mediaAsset: {
          updateMany: async () => {
            throw new Error("DB unavailable");
          },
        },
      },
    }),
    /DB unavailable/,
  );
  assert.deepEqual(removed, [cloud.cloudinaryPublicId]);
  assert.equal(await fs.readFile(file, "utf8"), "legacy-photo");
});

test("An overlapping migration cleans up only its own extra upload", async (t) => {
  const { directory, asset, file } = await fixture(t);
  let uploadedId;
  t.mock.method(storage, "uploadProductImage", async (data, { id }) => {
    uploadedId = id;
    assert.notEqual(id, asset.id);
    return {
      cloudinaryPublicId: id,
      cloudinaryUrl: "https://res.cloudinary.com/demo/image/upload/copy.webp",
    };
  });
  const removed = [];
  t.mock.method(storage, "removeProductImage", async (id) => removed.push(id));
  assert.equal(
    await migrateLocalImage(asset, {
      directory,
      prisma: {
        mediaAsset: {
          updateMany: async ({ where }) => {
            assert.equal(where.cloudinaryUrl, null);
            return { count: 0 };
          },
        },
      },
    }),
    "already-cloud",
  );
  assert.deepEqual(removed, [uploadedId]);
  await fs.access(file);
});
