const path = require("node:path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
  quiet: true,
});
const prisma = require("../config/prisma");
const { cloudinaryConfig } = require("../services/cloudinaryStorage");
const { migrateLocalImage } = require("../services/migrateLocalMedia");

async function main() {
  const { assertNeonDatabase } =
    await import("../../scripts/runtime-config.mjs");
  assertNeonDatabase(process.env.DATABASE_URL);
  cloudinaryConfig();
  const directory = path.resolve(
    process.env.MEDIA_DIRECTORY ||
      path.join(__dirname, "../.local/product-media"),
  );
  let cursor,
    migrated = 0,
    skipped = 0;
  while (true) {
    const assets = await prisma.mediaAsset.findMany({
      where: { cloudinaryUrl: null },
      orderBy: { id: "asc" },
      take: 100,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    if (!assets.length) break;
    for (const asset of assets) {
      const result = await migrateLocalImage(asset, { prisma, directory });
      if (result === "migrated") migrated++;
      else skipped++;
      console.log(`${asset.id}: ${result}`);
    }
    cursor = assets.at(-1).id;
  }
  console.log(
    `Cloudinary migration complete: ${migrated} moved, ${skipped} skipped. Local files retained.`,
  );
  if (skipped)
    console.log(
      "Run again on the computer holding any missing image files. Existing cloud images are skipped.",
    );
}
main()
  .catch((error) => {
    console.error(
      error.expose
        ? error.message
        : "Photo migration failed. Check database migrations, Neon/Cloudinary settings and local file access. Existing files were kept; retry after correcting the issue.",
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
