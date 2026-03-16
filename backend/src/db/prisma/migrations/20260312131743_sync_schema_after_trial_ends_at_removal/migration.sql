/*
  Warnings:

  - You are about to drop the column `trial_ends_at` on the `tenants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "trial_ends_at",
ADD COLUMN     "subscription_starts_at" TIMESTAMP(3);
