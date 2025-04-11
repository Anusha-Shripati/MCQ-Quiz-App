/*
  Warnings:

  - The `correct_answer` column on the `Questions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Questions" DROP COLUMN "correct_answer",
ADD COLUMN     "correct_answer" TEXT[];
