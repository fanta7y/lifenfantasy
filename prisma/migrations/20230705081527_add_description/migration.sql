/*
  Warnings:

  - You are about to alter the column `Phone` on the `users` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `Phone` INTEGER NOT NULL;
