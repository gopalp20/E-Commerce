// Prisma 5's TCP pool needs room for Neon wake-up and cross-region latency.
// Preserve operator overrides and never rewrite the user's environment file.
function databaseUrl(value) {
  if (!value) return value;
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      "DATABASE_URL must be a valid PostgreSQL connection string.",
    );
  }
  if (!url.hostname.endsWith(".neon.tech")) return value;
  for (const [key, setting] of Object.entries({
    connect_timeout: "15",
    pool_timeout: "15",
    connection_limit: "5",
  })) {
    if (!url.searchParams.has(key)) url.searchParams.set(key, setting);
  }
  return url.toString();
}
module.exports = { databaseUrl };
