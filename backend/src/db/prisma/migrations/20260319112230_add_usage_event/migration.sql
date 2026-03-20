-- CreateTable
CREATE TABLE "usage_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "metric_type" "UsageMetric" NOT NULL,
    "event_value" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usage_events_metric_type_idx" ON "usage_events"("metric_type");

-- CreateIndex
CREATE INDEX "usage_events_created_at_idx" ON "usage_events"("created_at");

-- CreateIndex
CREATE INDEX "usage_events_tenant_id_metric_type_created_at_idx" ON "usage_events"("tenant_id", "metric_type", "created_at");

-- AddForeignKey
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
