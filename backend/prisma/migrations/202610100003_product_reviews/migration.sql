CREATE TYPE "ReviewStatus" AS ENUM ('PUBLISHED', 'HIDDEN');
CREATE TABLE "Review" (
 "id" SERIAL PRIMARY KEY,
 "productId" INTEGER NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "rating" INTEGER NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
 "title" TEXT NOT NULL,
 "body" TEXT NOT NULL,
 "status" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED',
 "moderationReason" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");
CREATE INDEX "Review_productId_status_createdAt_idx" ON "Review"("productId", "status", "createdAt");
CREATE TABLE "ReviewVote" (
 "reviewId" INTEGER NOT NULL REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 PRIMARY KEY ("reviewId", "userId")
);
