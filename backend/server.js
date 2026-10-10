require("dotenv").config({ quiet: true });
const app = require("./app");
const prisma = require("./config/prisma");
async function start() {
  const missing = ["DATABASE_URL", "JWT_SECRET", "PORT"].filter(
    (key) => !process.env[key],
  );
  if (missing.length)
    throw new Error("Missing environment settings: " + missing.join(", "));
  await prisma.$connect();
  const server = app.listen(
    Number(process.env.PORT),
    process.env.HOST || "127.0.0.1",
  );
  server.on("listening", () =>
    console.log(`FORME API ready on http://127.0.0.1:${process.env.PORT}`),
  );
  server.on("error", (error) => {
    console.error(error.message);
    prisma.$disconnect();
    process.exitCode = 1;
  });
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () =>
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      }),
    );
}
start().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
