import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { runtimeConfig } from "./runtime-config.mjs";

export async function loadEnvironment(root) {
  if (!existsSync(path.join(root, "backend/node_modules/dotenv")))
    throw new Error("Run npm run setup before starting FORME.");
  const { default: dotenv } =
    await import("../backend/node_modules/dotenv/lib/main.js");
  const file = path.join(root, "backend/.env");
  const env = {
    ...(existsSync(file) ? dotenv.parse(readFileSync(file)) : {}),
    ...process.env,
  };
  const ports = runtimeConfig(env);
  return { ports, env: { ...env, PORT: String(ports.api), HOST: "127.0.0.1" } };
}
