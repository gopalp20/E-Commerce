const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const storage = require("./cloudinaryStorage");

async function migrateLocalImage(asset, { prisma, directory }) {
  if (asset.cloudinaryUrl) return "already-cloud";
  const match = /^\/api\/media\/images\/([a-f0-9-]{36}\.webp)$/.exec(asset.url);
  if (!match) return "not-local";
  const file = path.join(directory, match[1]);
  let stat;
  try {
    stat = await fs.lstat(file);
  } catch (error) {
    if (error.code === "ENOENT") return "missing-file";
    throw error;
  }
  if (!stat.isFile() || stat.size > 8 * 1024 * 1024) return "invalid-file";
  const data = await fs.readFile(file);
  // A unique upload ID makes cleanup safe if two migration attempts overlap.
  const cloud = await storage.uploadProductImage(data, {
    id: randomUUID(),
    ownerId: asset.ownerId,
  });
  try {
    const result = await prisma.mediaAsset.updateMany({
      where: { id: asset.id, cloudinaryUrl: null },
      data: cloud,
    });
    if (!result.count) {
      await storage.removeProductImage(cloud.cloudinaryPublicId);
      return "already-cloud";
    }
  } catch (error) {
    await storage.removeProductImage(cloud.cloudinaryPublicId);
    throw error;
  }
  // Keep the local file and original URL: galleries, bags and order snapshots
  // keep their references and the public media route now redirects to the CDN.
  return "migrated";
}

module.exports = { migrateLocalImage };
