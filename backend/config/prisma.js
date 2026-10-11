const { PrismaClient } = require("@prisma/client");
const { databaseUrl } = require("./databaseOptions");

const url = databaseUrl(process.env.DATABASE_URL);
const prisma = new PrismaClient({
  ...(url && { datasources: { db: { url } } }),
  transactionOptions: { maxWait: 10000, timeout: 15000 },
});

module.exports = prisma;
