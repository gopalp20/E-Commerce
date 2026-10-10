ALTER TABLE "Product" ADD COLUMN "specifications" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "ProductImage" ADD COLUMN "alt" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProductImage" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;
WITH ordered AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "productId" ORDER BY "id") - 1 AS position
  FROM "ProductImage"
)
UPDATE "ProductImage" SET "position" = ordered.position FROM ordered WHERE "ProductImage"."id" = ordered."id";
CREATE TABLE "MediaAsset" (
  "id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "ownerId" INTEGER NOT NULL,
  "bytes" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MediaAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "MediaAsset_url_key" ON "MediaAsset"("url");
CREATE INDEX "MediaAsset_ownerId_idx" ON "MediaAsset"("ownerId");
