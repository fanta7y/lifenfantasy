/*
  Warnings:

  - You are about to drop the column `sender` on the `msg` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[vkid]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sender_id` to the `msg` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `msg` DROP COLUMN `sender`,
    ADD COLUMN `sender_id` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_vkid_key` ON `users`(`vkid`);

-- AddForeignKey
ALTER TABLE `msg` ADD CONSTRAINT `msg_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`vkid`) ON DELETE RESTRICT ON UPDATE CASCADE;
