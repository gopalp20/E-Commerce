ALTER TABLE "Order"
  ADD COLUMN "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "shippingAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'INR',
  ADD COLUMN "shippingAddress" JSONB,
  ADD COLUMN "deliveryMethod" TEXT NOT NULL DEFAULT 'STANDARD',
  ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'COD',
  ADD COLUMN "checkoutKey" TEXT,
  ADD COLUMN "checkoutFingerprint" TEXT;
UPDATE "Order" SET "subtotal" = "totalAmount";
CREATE UNIQUE INDEX "Order_userId_checkoutKey_key" ON "Order"("userId", "checkoutKey");
ALTER TABLE "OrderItem" ADD COLUMN "productName" TEXT, ADD COLUMN "productImage" TEXT;
UPDATE "OrderItem" AS item SET "productName" = product.name, "productImage" = product."imageUrl"
  FROM "Product" AS product WHERE item."productId" = product.id;

