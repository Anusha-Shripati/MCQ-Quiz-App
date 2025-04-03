/*
  Warnings:

  - You are about to drop the column `total` on the `Assessments` table. All the data in the column will be lost.
  - You are about to alter the column `easy` on the `Assessments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `medium` on the `Assessments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `hard` on the `Assessments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to drop the `Assessments_technology` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Assessments_technology" DROP CONSTRAINT "Assessments_technology_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "Assessments_technology" DROP CONSTRAINT "Assessments_technology_technology_id_fkey";

-- DropIndex
DROP INDEX "Technology_name_key";

-- AlterTable
ALTER TABLE "Assessments" DROP COLUMN "total",
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "easy" SET DEFAULT 0,
ALTER COLUMN "easy" SET DATA TYPE INTEGER,
ALTER COLUMN "medium" SET DEFAULT 0,
ALTER COLUMN "medium" SET DATA TYPE INTEGER,
ALTER COLUMN "hard" SET DEFAULT 0,
ALTER COLUMN "hard" SET DATA TYPE INTEGER;

-- DropTable
DROP TABLE "Assessments_technology";

-- CreateTable
CREATE TABLE "Assessment_technology" (
    "id" TEXT NOT NULL,
    "technology_id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "easy" INTEGER NOT NULL DEFAULT 0,
    "medium" INTEGER NOT NULL DEFAULT 0,
    "hard" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Assessment_technology_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Assessment_technology" ADD CONSTRAINT "Assessment_technology_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "Assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment_technology" ADD CONSTRAINT "Assessment_technology_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "Technology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
