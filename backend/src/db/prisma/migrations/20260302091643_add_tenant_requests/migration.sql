-- CreateEnum
CREATE TYPE "TenantRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "tenant_requests" (
    "id" TEXT NOT NULL,
    "organization_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "admin_name" TEXT NOT NULL,
    "admin_email" TEXT NOT NULL,
    "admin_password" TEXT NOT NULL,
    "requested_plan_id" TEXT,
    "status" "TenantRequestStatus" NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "tenant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_requests_slug_key" ON "tenant_requests"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_requests_admin_email_key" ON "tenant_requests"("admin_email");

-- CreateIndex
CREATE INDEX "tenant_requests_status_idx" ON "tenant_requests"("status");

-- CreateIndex
CREATE INDEX "tenant_requests_admin_email_idx" ON "tenant_requests"("admin_email");

-- CreateIndex
CREATE INDEX "tenant_requests_slug_idx" ON "tenant_requests"("slug");

-- AddForeignKey
ALTER TABLE "tenant_requests" ADD CONSTRAINT "tenant_requests_requested_plan_id_fkey" FOREIGN KEY ("requested_plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_requests" ADD CONSTRAINT "tenant_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "platform_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_requests" ADD CONSTRAINT "tenant_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
