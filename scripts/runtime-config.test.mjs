import test from "node:test";
import assert from "node:assert/strict";
import { assertNeonDatabase, runtimeConfig } from "./runtime-config.mjs";

const env = {
  DATABASE_URL:
    "postgresql://owner:private@ep-demo-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  JWT_SECRET: "a-test-secret-not-used-by-the-application",
};

test("Neon URLs work without a bundled database port", () => {
  assert.deepEqual(runtimeConfig(env), { api: 5050, web: 5173 });
  assert.deepEqual(
    runtimeConfig({ ...env, PORT: "5000", FORME_WEB_PORT: "5180" }),
    { api: 5000, web: 5180 },
  );
  assert.equal(
    runtimeConfig({ ...env, PORT: "5000", FORME_API_PORT: "5052" }).api,
    5052,
  );
  assert.doesNotThrow(() =>
    assertNeonDatabase(env.DATABASE_URL.replace("-pooler", "")),
  );
});

test("local, unrelated, malformed and insecure targets fail without leaking credentials", () => {
  for (const DATABASE_URL of [
    undefined,
    "private",
    "postgresql://owner:private@127.0.0.1:55432/forme",
    env.DATABASE_URL.replace(".neon.tech", ".neon.tech.example.com"),
    env.DATABASE_URL.replace("sslmode=require", "sslmode=disable"),
    env.DATABASE_URL.replace("postgresql:", "https:"),
  ])
    assert.throws(
      () => runtimeConfig({ ...env, DATABASE_URL }),
      (error) =>
        error.message.includes("Neon") && !error.message.includes("private"),
    );
});

test("missing secrets and invalid or colliding ports fail before processes start", () => {
  assert.throws(() => runtimeConfig({ ...env, JWT_SECRET: "" }), /JWT_SECRET/);
  assert.throws(
    () => runtimeConfig({ ...env, JWT_SECRET: "replace_with_a_random_secret" }),
    /JWT_SECRET/,
  );
  for (const PORT of ["", "0", "80", "65536", "5050.5", "5e3", "port", "-1"])
    assert.throws(() => runtimeConfig({ ...env, PORT }), /integer/);
  assert.throws(() => runtimeConfig({ ...env, PORT: "5173" }), /different/);
});
