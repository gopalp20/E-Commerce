const test = require("node:test");
const assert = require("node:assert/strict");
const { testDatabaseUrl } = require("./databaseTarget");
const app =
  "postgresql://app:private@ep-store-pooler.test.neon.tech/neondb?sslmode=require";

test("integration tests require an explicit independent database", () => {
  assert.throws(() => testDatabaseUrl(app), /Set TEST_DATABASE_URL/);
  assert.throws(() => testDatabaseUrl(app, app), /must not target/);
  assert.throws(
    () =>
      testDatabaseUrl(
        app,
        app.replace("-pooler", "").replace("app:private", "other:secret"),
      ),
    /must not target/,
  );
  assert.throws(
    () =>
      testDatabaseUrl(
        "postgresql://a:b@localhost:55432/forme",
        "postgresql://x:y@127.0.0.1:55432/forme",
      ),
    /must not target/,
  );
  assert.match(
    testDatabaseUrl(app, app.replace("ep-store", "ep-tests")),
    /ep-tests/,
  );
});

test("invalid test database settings do not disclose credentials", () => {
  for (const value of ["private-value", "https://app:private@example.com/test"])
    assert.throws(
      () => testDatabaseUrl(app, value),
      (error) => !error.message.includes("private"),
    );
});
