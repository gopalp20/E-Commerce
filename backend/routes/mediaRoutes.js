const express = require("express");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const sharp = require("sharp");
const prisma = require("../config/prisma");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const storage = require("../services/cloudinaryStorage");
const router = express.Router();
const directory = path.resolve(
  process.env.MEDIA_DIRECTORY ||
    path.join(__dirname, "../.local/product-media"),
);
const types = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

router.post(
  "/images",
  protect,
  authorize("VENDOR", "ADMIN"),
  express.raw({ type: Object.keys(types), limit: "8mb" }),
  asyncHandler(async (req, res) => {
    const expected = types[req.get("Content-Type")?.split(";")[0]];
    if (!expected || !Buffer.isBuffer(req.body) || !req.body.length)
      throw new AppError("Choose a JPG, PNG or WebP photo up to 8 MB.", 400);
    let data, info;
    try {
      const image = sharp(req.body, {
        limitInputPixels: 40000000,
        failOn: "warning",
      });
      const meta = await image.metadata();
      if (meta.format !== expected || meta.pages > 1)
        throw Error("Unsupported image");
      ({ data, info } = await image
        .rotate()
        .resize({
          width: 2000,
          height: 2000,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer({ resolveWithObject: true }));
    } catch {
      throw new AppError(
        "This photo could not be read. Use a valid, non-animated JPG, PNG or WebP under 40 megapixels.",
        400,
      );
    }
    if (
      (await prisma.mediaAsset.count({ where: { ownerId: req.user.id } })) >=
      2000
    )
      throw new AppError(
        "Your store has reached its photo storage limit.",
        409,
      );
    const id = randomUUID(),
      filename = `${id}.webp`,
      url = `/api/media/images/${filename}`;
    const cloud = await storage.uploadProductImage(data, {
      id,
      ownerId: req.user.id,
    });
    try {
      await prisma.mediaAsset.create({
        data: { id, url, ownerId: req.user.id, bytes: data.length, ...cloud },
      });
    } catch (error) {
      await storage.removeProductImage(cloud.cloudinaryPublicId);
      throw error;
    }
    res.status(201).json({
      success: true,
      image: { url, width: info.width, height: info.height },
    });
  }),
);
router.get(
  "/images/:filename",
  asyncHandler(async (req, res, next) => {
    if (!/^[a-f0-9-]{36}\.webp$/.test(req.params.filename))
      return next(new AppError("Photo not found", 404));
    const asset = await prisma.mediaAsset.findUnique({
      where: { url: `/api/media/images/${req.params.filename}` },
      select: { cloudinaryUrl: true },
    });
    if (!asset) return next(new AppError("Photo not found", 404));
    if (asset.cloudinaryUrl) {
      if (!storage.isCloudinaryImageUrl(asset.cloudinaryUrl))
        return next(new AppError("Photo not found", 404));
      res.set({
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=86400",
      });
      return res.redirect(302, asset.cloudinaryUrl);
    }
    // Old uploads remain readable from their existing persistent directory.
    res.set({
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    res.sendFile(req.params.filename, { root: directory }, (error) => {
      if (error) next(new AppError("Photo not found", 404));
    });
  }),
);
module.exports = router;
