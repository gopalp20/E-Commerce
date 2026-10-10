import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadEnvironment } from "./environment.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const action = process.argv[2];
try {
  if (!["setup", "migrate", "seed"].includes(action))
    throw new Error("Use npm run db:setup, db:migrate or db:seed.");
  const { env } = await loadEnvironment(root);
  async function run(args, childEnv = env) {
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, args, {
        cwd: path.join(root, "backend"),
        env: childEnv,
        stdio: "inherit",
      });
      child.once("error", reject);
      child.once("exit", (code) =>
        code === 0
          ? resolve()
          : reject(
              new Error(
                "Database setup failed. Check the output above; no database reset was requested.",
              ),
            ),
      );
    });
  }
  if (action !== "seed")
    await run(["node_modules/prisma/build/index.js", "migrate", "deploy"]);
  if (action !== "migrate")
    await run(["prisma/seed.js"], { ...env, ALLOW_DEMO_SEED: "yes" });
  console.log(
    action === "migrate"
      ? "Neon migrations applied."
      : "Neon demo setup complete. Start the store with npm run dev.",
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
