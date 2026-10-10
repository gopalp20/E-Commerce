import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { localPorts } from "../../scripts/local-config.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const local = path.join(root, ".local");
mkdirSync(local, { recursive: true });
const configFile = path.join(local, "database.json");
const ports = localPorts(
  process.env,
  existsSync(configFile)
    ? JSON.parse(readFileSync(configFile, "utf8")).port
    : undefined,
);
if (!existsSync(configFile)) {
  writeFileSync(
    configFile,
    JSON.stringify({
      password: randomBytes(24).toString("hex"),
      port: ports.db,
    }),
    { mode: 0o600 },
  );
}
const config = JSON.parse(readFileSync(configFile, "utf8"));
const databaseDir = path.join(local, "postgres");
const pg = new EmbeddedPostgres({
  databaseDir,
  user: "forme",
  password: config.password,
  port: config.port,
  persistent: true,
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: (message) => {
    if (!message.includes("LOG:")) console.error(message);
  },
});
if (!existsSync(path.join(databaseDir, "PG_VERSION"))) await pg.initialise();
await pg.start();
const client = pg.getPgClient();
await client.connect();
for (const name of ["forme", "forme_test"]) {
  const result = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [name],
  );
  if (!result.rowCount) await client.query(`CREATE DATABASE ${name}`);
}
await client.end();
const envPath = path.join(root, "backend/.env");
if (!existsSync(envPath)) {
  writeFileSync(
    envPath,
    `PORT=${ports.api}\nDATABASE_URL="postgresql://forme:${config.password}@127.0.0.1:${config.port}/forme?schema=public"\nJWT_SECRET=${randomBytes(48).toString("hex")}\n`,
    { mode: 0o600 },
  );
}
console.log(
  `FORME PostgreSQL is ready on 127.0.0.1:${config.port}. Local data persists in .local/postgres.`,
);
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await pg.stop();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 60_000);
