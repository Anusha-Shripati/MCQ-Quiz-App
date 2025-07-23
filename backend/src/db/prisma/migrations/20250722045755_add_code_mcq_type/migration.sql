/*
  Warnings:

  - The values [code_mcq] on the enum `Question_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Question_type_new" AS ENUM ('multiple_select', 'video', 'text', 'mcq', 'code_snippet', 'code_editor', 'code_snippet_with_mcq');
ALTER TABLE "Questions" ALTER COLUMN "type" TYPE "Question_type_new" USING ("type"::text::"Question_type_new");
ALTER TYPE "Question_type" RENAME TO "Question_type_old";
ALTER TYPE "Question_type_new" RENAME TO "Question_type";
DROP TYPE "Question_type_old";
COMMIT;
