-- Product lifecycle and soft delete fields.
ALTER TABLE `Product`
    ADD COLUMN `status` ENUM('ACTIVE', 'OUT_OF_STOCK', 'DRAFT', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- A product can have any number of images.
CREATE TABLE `ProductImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `productId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `Product_categoryId_status_deleted_idx` ON `Product`(`categoryId`, `status`, `deleted`);
CREATE INDEX `Product_price_idx` ON `Product`(`price`);
CREATE INDEX `Product_vendorId_deleted_idx` ON `Product`(`vendorId`, `deleted`);
CREATE INDEX `ProductImage_productId_idx` ON `ProductImage`(`productId`);

ALTER TABLE `ProductImage`
    ADD CONSTRAINT `ProductImage_productId_fkey`
    FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
