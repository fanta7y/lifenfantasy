/*
  Warnings:

  - You are about to drop the column `location_id` on the `offers` table. All the data in the column will be lost.
  - You are about to drop the `locations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `items` DROP FOREIGN KEY `items_location_id_fkey`;

-- AlterTable
ALTER TABLE `items` MODIFY `location_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `offers` DROP COLUMN `location_id`;

-- DropTable
DROP TABLE `locations`;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `users`(`vkid`) ON DELETE RESTRICT ON UPDATE CASCADE;
