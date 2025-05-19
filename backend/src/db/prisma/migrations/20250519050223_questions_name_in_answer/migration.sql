/*
  Warnings:

  - The `user_answer` column on the `Answers` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "Answers" DROP CONSTRAINT "Answers_question_id_fkey";

-- AlterTable
ALTER TABLE "Answers" ADD COLUMN     "question_name" TEXT,
ALTER COLUMN "question_id" DROP NOT NULL,
DROP COLUMN "user_answer",
ADD COLUMN     "user_answer" TEXT[];

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
