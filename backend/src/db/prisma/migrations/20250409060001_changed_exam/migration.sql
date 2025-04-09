-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_user_id_fkey";

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
