require("dotenv").config({ quiet: true });
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { catalogue, accounts, categories } = require("./demoCatalogue");
const prisma = new PrismaClient();
async function main() {
  const { assertNeonDatabase } =
    await import("../../scripts/runtime-config.mjs");
  assertNeonDatabase(process.env.DATABASE_URL);
  if (process.env.ALLOW_DEMO_SEED !== "yes")
    throw new Error(
      "Run npm run db:seed to explicitly create the demo accounts in Neon.",
    );
  const password = await bcrypt.hash("FormeDemo2026!", 10);
  const users = {};
  for (const account of accounts)
    users[account.email] = await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: { ...account, password },
    });
  const categoryRows = {};
  for (const category of categories)
    categoryRows[category.slug] = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  const vendors = [users["studio@forme.demo"], users["objects@forme.demo"]];
  for (const [index, item] of catalogue.entries()) {
    const vendorId = vendors[item.vendorIndex].id;
    if (
      await prisma.product.findFirst({ where: { name: item.name, vendorId } })
    )
      continue;
    const images = item.photos.map(({ file, alt }, position) => ({
      url: "/images/" + file,
      alt,
      position,
    }));
    await prisma.product.create({
      data: {
        name: item.name,
        description: item.description,
        price: item.price,
        stock: item.stock,
        specifications: item.specifications,
        status: "ACTIVE",
        vendorId,
        categoryId: categoryRows[item.category].id,
        imageUrl: images[0].url,
        images: { create: images },
        createdAt: new Date(Date.now() - index * 86400000),
      },
    });
  }
  console.log(
    "FORME: 20 demo products and four accounts are ready. Existing data was preserved.",
  );
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
