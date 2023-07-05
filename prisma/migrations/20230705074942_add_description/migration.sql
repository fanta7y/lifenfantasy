/*
  Warnings:

  - You are about to drop the column `sender_id` on the `msg` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `msg` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `msg` DROP FOREIGN KEY `msg_sender_id_fkey`;

-- AlterTable
ALTER TABLE `msg` DROP COLUMN `sender_id`,
    ADD COLUMN `user_id` VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE `msg` ADD CONSTRAINT `msg_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`vkid`) ON DELETE RESTRICT ON UPDATE CASCADE;
