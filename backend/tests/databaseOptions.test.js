const { test } = require("node:test");
const assert = require("node:assert/strict");
const { databaseUrl } = require("../config/databaseOptions");
const neon =
  "postgresql://owner:encoded%40password@ep-test-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

test("Neon connection defaults preserve credentials, TLS and database identity", () => {
  const before = new URL(neon),
    after = new URL(databaseUrl(neon));
  for (const key of ["hostname", "username", "password", "pathname", "port"])
    assert.equal(after[key], before[key]);
  assert.deepEqual(Object.fromEntries(after.searchParams), {
    sslmode: "require",
    channel_binding: "require",
    connect_timeout: "15",
    pool_timeout: "15",
    connection_limit: "5",
  });
});
test("Explicit pool settings and independent test databases are left intact", () => {
  const url = neon + "&connect_timeout=25&pool_timeout=30&connection_limit=2";
  assert.equal(databaseUrl(url), url);
  const local = "postgresql://test:test@127.0.0.1:55439/forme_test";
  assert.equal(databaseUrl(local), local);
  assert.equal(databaseUrl(undefined), undefined);
  assert.throws(
    () => databaseUrl("private-invalid-value"),
    (error) => !error.message.includes("private-invalid-value"),
  );
});
