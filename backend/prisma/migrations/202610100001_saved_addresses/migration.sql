CREATE TABLE "Address" (
 "id" SERIAL NOT NULL,
 "userId" INTEGER NOT NULL,
 "label" TEXT NOT NULL DEFAULT 'Home',
 "name" TEXT NOT NULL,
 "phone" TEXT NOT NULL,
 "line1" TEXT NOT NULL,
 "line2" TEXT NOT NULL DEFAULT '',
 "city" TEXT NOT NULL,
 "state" TEXT NOT NULL,
 "postalCode" TEXT NOT NULL,
 "country" TEXT NOT NULL DEFAULT 'India',
 "isDefault" BOOLEAN NOT NULL DEFAULT false,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Address_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Address_userId_idx" ON "Address"("userId");
CREATE UNIQUE INDEX "Address_one_default_per_user" ON "Address"("userId") WHERE "isDefault" = true;
