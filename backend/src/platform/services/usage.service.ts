import { PrismaClient, UsageMetric } from '../../db/prisma/generated/client';

export interface UsageLimitCheck {
  allowed: boolean;
  current: number;
  limit: number;
  unlimited: boolean;
}

export interface UsageStats {
  tenantId: string;
  planName: string;
  usage: Record<string, {
    current: number;
    limit: number;
    percentage: number;
    unlimited: boolean; 
  }>;
  lastUpdated: Date;
}

export interface TenantUsageSummary {
  tenantId: string;
  tenantName: string;
  planName: string;
  metrics: Record<string, { current: number; limit: number; percentage: number }>;
}

export class UsageService {
  constructor(private prisma: PrismaClient) {}

  async checkUsageLimit(tenantId: string, metricType: UsageMetric): Promise<UsageLimitCheck> {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const limits = tenant.plan.limits as Record<string, number>;
    const limit = limits[metricType] ?? 0;
    const unlimited = limit === -1;

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    let usage = await this.prisma.tenant_usage.findUnique({
      where: {
        tenant_id_metric_type_period_start: {
          tenant_id: tenantId,
          metric_type: metricType,
          period_start: periodStart,
        },
      },
    });

    if (!usage) {
      usage = await this.prisma.tenant_usage.create({
        data: {
          tenant_id: tenantId,
          metric_type: metricType,
          current_value: 0,
          limit_value: limit,
          period_start: periodStart,
          period_end: periodEnd,
        },
      });
    }

    return {
      allowed: unlimited || usage.current_value < limit,
      current: usage.current_value,
      limit,
      unlimited,
    };
  }

  async incrementUsage(tenantId: string, metricType: UsageMetric, amount: number = 1): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const limits = tenant.plan.limits as Record<string, number>;
    const limit = limits[metricType] ?? 0;

    await this.prisma.tenant_usage.upsert({
      where: {
        tenant_id_metric_type_period_start: {
          tenant_id: tenantId,
          metric_type: metricType,
          period_start: periodStart,
        },
      },
      update: {
        current_value: { increment: amount },
      },
      create: {
        tenant_id: tenantId,
        metric_type: metricType,
        current_value: amount,
        limit_value: limit,
        period_start: periodStart,
        period_end: periodEnd,
      },
    });
  }

  async decrementUsage(tenantId: string, metricType: UsageMetric, amount: number = 1): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    await this.prisma.tenant_usage.updateMany({
      where: {
        tenant_id: tenantId,
        metric_type: metricType,
        period_start: periodStart,
      },
      data: {
        current_value: { decrement: amount },
      },
    });
  }

  async getUsageStats(tenantId: string): Promise<UsageStats> {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      include: { plan: true, usage: true },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const limits = tenant.plan.limits as Record<string, number>;
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const currentUsage = await this.prisma.tenant_usage.findMany({
      where: {
        tenant_id: tenantId,
        period_start: periodStart,
      },
    });

    const usage: Record<string, any> = {};
    Object.values(UsageMetric).forEach((metric) => {
      const metricUsage = currentUsage.find((u) => u.metric_type === metric);
      const limit = limits[metric] ?? 0;
      const current = metricUsage?.current_value ?? 0;
      const unlimited = limit === -1;

      usage[metric] = {
        current,
        limit,
        percentage: unlimited ? 0 : limit > 0 ? Math.round((current / limit) * 100) : 0,
        unlimited,
      };
    });

    return {
      tenantId: tenant.id,
      planName: tenant.plan.name,
      usage,
      lastUpdated: new Date(),
    };
  }

  async resetUsage(tenantId: string, metricType: UsageMetric): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    await this.prisma.tenant_usage.updateMany({
      where: {
        tenant_id: tenantId,
        metric_type: metricType,
        period_start: periodStart,
      },
      data: {
        current_value: 0,
      },
    });
  }

  async getCurrentUsage(tenantId: string, metricType: UsageMetric): Promise<number> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const usage = await this.prisma.tenant_usage.findUnique({
      where: {
        tenant_id_metric_type_period_start: {
          tenant_id: tenantId,
          metric_type: metricType,
          period_start: periodStart,
        },
      },
    });

    return usage?.current_value ?? 0;
  }

  async getAllTenantsUsage(): Promise<TenantUsageSummary[]> {
    const tenants = await this.prisma.tenants.findMany({
      where: { deleted_at: null },
      include: { plan: true, usage: true },
    });

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return tenants.map((tenant) => {
      const limits = tenant.plan.limits as Record<string, number>;
      const currentUsage = tenant.usage.filter(
        (u) => u.period_start.getTime() === periodStart.getTime()
      );

      const metrics: Record<string, any> = {};
      Object.values(UsageMetric).forEach((metric) => {
        const metricUsage = currentUsage.find((u) => u.metric_type === metric);
        const limit = limits[metric] ?? 0;
        const current = metricUsage?.current_value ?? 0;

        metrics[metric] = {
          current,
          limit,
          percentage: limit === -1 ? 0 : limit > 0 ? Math.round((current / limit) * 100) : 0,
        };
      });

      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
        planName: tenant.plan.name,
        metrics,
      };
    });
  }

  async syncUsageFromDatabase(tenantId: string, tenantPrisma: any): Promise<void> {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const limits = tenant.plan.limits as Record<string, number>;
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [candidatesCount, assessmentsCount, questionsCount] = await Promise.all([
      tenantPrisma.candidate.count({ where: { deleted_at: null } }),
      tenantPrisma.assessments.count({ where: { deleted_at: null } }),
      tenantPrisma.questions.count({ where: { deleted_at: null } }),
    ]);

    const usageData = [
      { metric: UsageMetric.candidates, count: candidatesCount },
      { metric: UsageMetric.assessments, count: assessmentsCount },
      { metric: UsageMetric.questions, count: questionsCount },
    ];

    for (const { metric, count } of usageData) {
      await this.prisma.tenant_usage.upsert({
        where: {
          tenant_id_metric_type_period_start: {
            tenant_id: tenantId,
            metric_type: metric,
            period_start: periodStart,
          },
        },
        update: {
          current_value: count,
        },
        create: {
          tenant_id: tenantId,
          metric_type: metric,
          current_value: count,
          limit_value: limits[metric] ?? 0,
          period_start: periodStart,
          period_end: periodEnd,
        },
      });
    }
  }
}
