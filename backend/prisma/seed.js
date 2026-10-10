require("dotenv").config({ quiet: true });
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const catalogue = [
  [
    "The Sunday Chair",
    "living",
    18900,
    "forme-living.jpg",
    "A generous seat for slower mornings. Soft rust upholstery, a sculpted back and tapered wooden legs bring a little warmth to your favourite corner. A single lounge chair; side table and accessories are not included.",
    8,
  ],
  [
    "Halo Table Light",
    "workspace",
    3490,
    "lamp.jpg",
    "A simple white shade and a warm pool of light. Made for bedside reading, focused evenings and the end of a long day. One table lamp with a fabric shade and a stable base.",
    18,
  ],
  [
    "Daybreak Cup & Saucer",
    "objects",
    890,
    "cup.jpg",
    "Your first coffee deserves a good cup. A clean porcelain silhouette, comfortable handle and matching saucer for daily rituals. Includes one cup and one saucer. Hand-wash with care.",
    32,
  ],
  [
    "The Daily Carry",
    "everyday",
    4290,
    "bag.jpg",
    "Room for the things that come with you. A warm brown leather bag with simple lines and an easy everyday shape. Includes one bag; naturally occurring differences in leather make each piece individual.",
    14,
  ],
  [
    "Studio Headphones",
    "workspace",
    2990,
    "headphones.jpg",
    "Over-ear headphones for a little space of your own. A padded headband and cushioned ear cups make them a companion for your favourite records and focused afternoons. Includes one pair of wired headphones.",
    20,
  ],
  [
    "The Reading Chair",
    "living",
    14900,
    "forme-studio.jpg",
    "A dark wood accent chair with green upholstery and a welcoming shape. Set it by a window and make room for an unhurried chapter. Includes one upholstered chair; surrounding furnishings are not included.",
    6,
  ],
];
async function main() {
  const url = new URL(process.env.DATABASE_URL);
  if (
    !["localhost", "127.0.0.1"].includes(url.hostname) &&
    process.env.ALLOW_DEMO_SEED !== "yes"
  )
    throw new Error("Demo seeding is restricted to a local database.");
  const password = await bcrypt.hash("FormeDemo2026!", 10);
  for (const [email, name, role] of [
    ["hello@forme.demo", "Alex Morgan", "CUSTOMER"],
    ["studio@forme.demo", "Form & Field", "VENDOR"],
    ["objects@forme.demo", "Everyday Studio", "VENDOR"],
    ["admin@forme.demo", "FORME Admin", "ADMIN"],
  ]) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name, role, password },
    });
  }
  const vendors = await prisma.user.findMany({
    where: { email: { in: ["studio@forme.demo", "objects@forme.demo"] } },
    orderBy: { id: "asc" },
  });
  const categories = {};
  for (const [slug, name] of [
    ["living", "For the home"],
    ["objects", "Everyday objects"],
    ["workspace", "For your workspace"],
    ["everyday", "On the go"],
  ]) {
    categories[slug] = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { slug, name },
    });
  }
  for (const [
    index,
    [name, slug, price, image, description, stock],
  ] of catalogue.entries()) {
    const vendorId = vendors[index % 2].id;
    if (await prisma.product.findFirst({ where: { name, vendorId } })) continue;
    await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        imageUrl: "/images/" + image,
        status: "ACTIVE",
        vendorId,
        categoryId: categories[slug].id,
        createdAt: new Date(Date.now() - index * 86400000),
      },
    });
  }
  console.log(
    "FORME catalogue and four demo accounts are ready. Existing data was preserved.",
  );
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
