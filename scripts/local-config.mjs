// Keep a copied demo isolated without ever pointing its launcher at a hosted DB.
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

export function localPorts(env = process.env, storedDbPort) {
  const db = port(env.FORME_DB_PORT, storedDbPort ?? 55432, "FORME_DB_PORT");
  const api = port(env.FORME_API_PORT, 5050, "FORME_API_PORT");
  const web = port(env.FORME_WEB_PORT, 5173, "FORME_WEB_PORT");
  if (storedDbPort !== undefined && db !== Number(storedDbPort))
    throw new Error(
      `This checkout's database uses port ${storedDbPort}. Keep that port to preserve its saved data, or use a separate fresh copy.`,
    );
  if (new Set([db, api, web]).size !== 3)
    throw new Error("FORME database, API and web ports must be different.");
  return { db, api, web };
}

export function assertLocalDatabase(connectionString, dbPort) {
  let url;
  try {
    url = new URL(connectionString);
  } catch {
    /* Report no credentials. */
  }
  if (
    !url ||
    !["postgresql:", "postgres:"].includes(url.protocol) ||
    url.hostname !== "127.0.0.1" ||
    Number(url.port) !== dbPort ||
    url.pathname !== "/forme"
  )
    throw new Error(
      "backend/.env points away from this local FORME database. Use a separate environment for deployment.",
    );
}
