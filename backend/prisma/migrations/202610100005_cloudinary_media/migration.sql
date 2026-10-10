-- Existing local image references remain valid; new uploads use Cloudinary.
ALTER TABLE "MediaAsset"
ADD COLUMN "cloudinaryPublicId" TEXT,
ADD COLUMN "cloudinaryUrl" TEXT;

CREATE UNIQUE INDEX "MediaAsset_cloudinaryPublicId_key" ON "MediaAsset"("cloudinaryPublicId");
