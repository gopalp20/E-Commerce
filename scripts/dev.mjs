import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { assertLocalDatabase, localPorts } from "./local-config.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const children = new Set();
let stopping = false;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const listening = (port) =>
  new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
function run(command, args, cwd, options = {}) {
  const child = spawn(command, args, { cwd, stdio: "inherit", ...options });
  children.add(child);
  child.once("exit", () => children.delete(child));
  child.once("error", (error) => {
    console.error(error.message);
    stop(1);
  });
  return child;
}
async function finished(child) {
  const code = await new Promise((resolve) => child.once("exit", resolve));
  if (code !== 0)
    throw new Error("A setup command failed. See the output above.");
}
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
  for (let i = 0; i < 50 && children.size; i++) await delay(100);
  process.exit(code);
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
try {
  if (
    !existsSync(path.join(root, "backend/node_modules")) ||
    !existsSync(path.join(root, "frontend/node_modules"))
  )
    throw new Error("Run npm run setup once before starting FORME.");
  const configFile = path.join(root, ".local/database.json");
  const storedDbPort = existsSync(configFile)
    ? JSON.parse(readFileSync(configFile, "utf8")).port
    : undefined;
  const ports = localPorts(process.env, storedDbPort);
  const { default: dotenv } =
    await import("../backend/node_modules/dotenv/lib/main.js");
  const envPath = path.join(root, "backend/.env");
  // Validate an existing environment before starting or modifying any database.
  if (existsSync(envPath))
    assertLocalDatabase(
      dotenv.parse(readFileSync(envPath)).DATABASE_URL,
      ports.db,
    );
  for (const port of Object.values(ports))
    if (await listening(port))
      throw new Error(
        `Port ${port} is already in use. Stop the previous FORME session before starting another.`,
      );
  const db = run(
    process.execPath,
    ["scripts/local-db.mjs"],
    path.join(root, "backend"),
    { stdio: ["inherit", "pipe", "inherit"] },
  );
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Local database startup timed out.")),
      60000,
    );
    db.once("exit", () => {
      clearTimeout(timeout);
      reject(new Error("Local database could not start."));
    });
    let output = "";
    db.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
      output += chunk.toString();
      if (output.includes("FORME PostgreSQL is ready")) {
        clearTimeout(timeout);
        resolve();
      }
    });
  });
  // The launcher must never migrate or seed an unrelated hosted database.
  const localEnv = dotenv.parse(readFileSync(envPath));
  assertLocalDatabase(localEnv.DATABASE_URL, ports.db);
  const env = {
    ...process.env,
    ...localEnv,
    PORT: String(ports.api),
    HOST: "127.0.0.1",
  };
  await finished(
    run(
      process.execPath,
      ["node_modules/prisma/build/index.js", "migrate", "deploy"],
      path.join(root, "backend"),
      { env },
    ),
  );
  await finished(
    run(process.execPath, ["prisma/seed.js"], path.join(root, "backend"), {
      env,
    }),
  );
  const api = run(
    process.execPath,
    ["--watch", "server.js"],
    path.join(root, "backend"),
    { env },
  );
  const web = run(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "--host",
      "127.0.0.1",
      "--port",
      String(ports.web),
      "--strictPort",
    ],
    path.join(root, "frontend"),
    { env: { ...process.env, FORME_API_PORT: String(ports.api) } },
  );
  for (const child of [db, api, web])
    child.once("exit", () => {
      if (!stopping) stop(1);
    });
  const deadline = Date.now() + 30_000;
  while (true) {
    try {
      // Let the API bind before probing through Vite, avoiding misleading
      // proxy errors during an otherwise healthy first start.
      const apiResponse = await fetch(`http://127.0.0.1:${ports.api}/`, {
        signal: AbortSignal.timeout(1000),
      });
      if (!apiResponse.ok) throw new Error("API is still starting.");
      const results = await Promise.all([
        fetch(`http://127.0.0.1:${ports.web}`, {
          signal: AbortSignal.timeout(1000),
        }),
        fetch(`http://127.0.0.1:${ports.web}/api/categories`, {
          signal: AbortSignal.timeout(1000),
        }),
      ]);
      if (
        results.every((response) => response.ok) &&
        (await results[1].json()).success === true
      )
        break;
    } catch {
      /* Services are still starting. */
    }
    if (Date.now() > deadline)
      throw new Error(
        "The store did not become ready. See the service output above.",
      );
    await delay(250);
  }
  console.log(
    `\nFORME is ready → http://127.0.0.1:${ports.web}\nAPI and database connection verified.\nPress Control-C to stop the store and its local database.\n`,
  );
} catch (error) {
  console.error(error.message);
  await stop(1);
}
