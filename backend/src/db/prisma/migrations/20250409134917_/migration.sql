-- AlterTable
ALTER TABLE "Exam" ALTER COLUMN "is_completed" SET DEFAULT false,
ALTER COLUMN "meta" DROP NOT NULL;
