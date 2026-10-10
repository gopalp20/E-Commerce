import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { loadEnvironment } from "./environment.mjs";
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
  const { ports, env } = await loadEnvironment(root);
  for (const port of Object.values(ports))
    if (await listening(port))
      throw new Error(
        `Port ${port} is already in use. Stop the previous FORME session before starting another.`,
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
  for (const child of [api, web])
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
        "The store did not become ready. Check the service output and run npm run db:setup once for a new Neon database.",
      );
    await delay(250);
  }
  console.log(
    `\nFORME is ready → http://127.0.0.1:${ports.web}\nAPI and Neon database connection verified.\nPress Control-C to stop the API and frontend. Your Neon data stays saved.\n`,
  );
} catch (error) {
  console.error(error.message);
  await stop(1);
}
