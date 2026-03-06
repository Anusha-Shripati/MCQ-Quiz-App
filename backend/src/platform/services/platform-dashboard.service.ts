import { PrismaClient, UsageMetric } from '../../db/prisma/generated/client';
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
