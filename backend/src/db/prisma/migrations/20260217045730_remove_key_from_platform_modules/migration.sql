/*
  Warnings:

  - You are about to drop the column `key` on the `platform_modules` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "platform_modules_key_key";

-- AlterTable
ALTER TABLE "platform_modules" DROP COLUMN "key";
