/*
  Warnings:

  - The values [storage_mb,api_calls] on the enum `UsageMetric` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UsageMetric_new" AS ENUM ('candidates', 'assessments', 'questions');
ALTER TABLE "tenant_usage" ALTER COLUMN "metric_type" TYPE "UsageMetric_new" USING ("metric_type"::text::"UsageMetric_new");
ALTER TYPE "UsageMetric" RENAME TO "UsageMetric_old";
ALTER TYPE "UsageMetric_new" RENAME TO "UsageMetric";
DROP TYPE "UsageMetric_old";
COMMIT;
