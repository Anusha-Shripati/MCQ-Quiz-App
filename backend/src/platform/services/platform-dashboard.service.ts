import { PrismaClient, UsageMetric } from '../../db/prisma/generated/client';

type ResourceUsage = {
  candidates: number;
  assessments: number;
  questions: number;
};
export class PlatformDashboardService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getPlanTenants() {
    const plans = await this.prisma.plans.findMany({
      select: {
        name: true,
        _count: {
          select: { tenants: true },
        },
      },
    });
    const data = plans.map((plan) => ({
      name: plan.name,
      tenantCount: plan._count.tenants,
    }));
    return data;
  }

  async getActiveTenants() {
    const activeTenants = await this.prisma.tenants.count({
      where: {
        status: {
          in: ['active', 'trial'],
        },
      },
    });
    return activeTenants;
  }
  async getTenantGrowth() {
    const tenants = await this.prisma.tenants.findMany({
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    });

    const monthlyData: Record<string, number> = {};

    tenants.forEach((tenant) => {
      const date = new Date(tenant.created_at);
      const monthOrYear = date.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });

      monthlyData[monthOrYear] = (monthlyData[monthOrYear] || 0) + 1;
    });

    return {
      categories: Object.keys(monthlyData),
      seriesData: Object.values(monthlyData),
    };
  }

  async getResourceUsage() {
    const usageData = await this.prisma.tenant_usage.findMany({
      select: {
        period_start: true,
        metric_type: true,
        current_value: true,
      },
    });
    const result: Record<string, ResourceUsage> = {};
    usageData.forEach((row) => {
      const date = row.period_start.toISOString();
      if (!result[date]) {
        result[date] = {
          candidates: 0,
          assessments: 0,
          questions: 0,
        };
      }
      result[date][row.metric_type] += row.current_value;
    });
    return Object.keys(result).map((date) => ({
      date,
      ...result[date],
    }));
  }

  async getPlatformUsage() {}

  // async getPlatformUsage() {}
  // async getPlatformUsage(tenant_id: string, metric_type: UsageMetric) {
  //   const data = {
  //     activeTenants: 120,
  //     totalTenants: 200,
  //     activeUsers: 450,
  //     totalUsers: 600,
  //     apiCallsLastMonth: 15000,
  //   };
  //   return data;
  // }
}
