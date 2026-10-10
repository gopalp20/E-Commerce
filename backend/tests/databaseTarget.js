// Explicitly separate integration fixtures from the application's database.
function databaseIdentity(url) {
  const host = url.hostname.replace(/-pooler(?=\.)/, "");
  return `${host === "localhost" ? "127.0.0.1" : host}:${url.port || "5432"}${url.pathname}`;
}

function testDatabaseUrl(applicationUrl, testUrl) {
  if (!testUrl)
    throw new Error(
      "Set TEST_DATABASE_URL to a separate test database or Neon test branch before running integration tests.",
    );
  let application, target;
  try {
    application = new URL(applicationUrl);
    target = new URL(testUrl);
  } catch {
    throw new Error(
      "DATABASE_URL and TEST_DATABASE_URL must be PostgreSQL connection strings.",
    );
  }
  if (
    !["postgres:", "postgresql:"].includes(target.protocol) ||
    !["postgres:", "postgresql:"].includes(application.protocol)
  )
    throw new Error("Test connections must use PostgreSQL.");
  if (databaseIdentity(application) === databaseIdentity(target))
    throw new Error(
      "TEST_DATABASE_URL must not target the application database, including its direct/pooler aliases.",
    );
  return target.toString();
}
module.exports = { testDatabaseUrl };
