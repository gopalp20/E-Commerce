export function port(value, fallback, name) {
  const candidate = value ?? fallback;
  if (
    !/^\d+$/.test(String(candidate)) ||
    Number(candidate) < 1024 ||
    Number(candidate) > 65535
  )
    throw new Error(`${name} must be an integer between 1024 and 65535.`);
  return Number(candidate);
}

export function assertNeonDatabase(connectionString) {
  let url;
  try {
    url = new URL(connectionString);
  } catch {
    /* Never echo credentials. */
  }
  if (
    !url ||
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !url.hostname.endsWith(".neon.tech") ||
    !url.username ||
    !url.password ||
    url.pathname.length < 2 ||
    !["require", "verify-ca", "verify-full"].includes(
      url.searchParams.get("sslmode"),
    )
  )
    throw new Error(
      "Set DATABASE_URL in backend/.env to your Neon PostgreSQL connection string with sslmode=require. Local databases are not used by this launcher.",
    );
}

export function runtimeConfig(env) {
  assertNeonDatabase(env.DATABASE_URL);
  if (!env.JWT_SECRET || env.JWT_SECRET === "replace_with_a_random_secret")
    throw new Error(
      "Set JWT_SECRET in backend/.env to a private random secret.",
    );
  const api = port(
    env.FORME_API_PORT ?? env.PORT,
    5050,
    "PORT / FORME_API_PORT",
  );
  const web = port(env.FORME_WEB_PORT, 5173, "FORME_WEB_PORT");
  if (api === web) throw new Error("API and web ports must be different.");
  return { api, web };
}
