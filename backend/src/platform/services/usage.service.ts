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

  /**
   * Validate if current date is within tenant's subscription period
   */
  private validateSubscriptionPeriod(tenant: any): { valid: boolean; error?: string } {
    const now = new Date();
    
    // Check if tenant has subscription dates
    if (!tenant.subscription_starts_at) {
      return { valid: false, error: 'Tenant missing subscription start date' };
    }

    if (!tenant.subscription_ends_at) {
      return { valid: false, error: 'Tenant missing subscription end date' };
    }

    // Check if subscription is active
    if (tenant.status === 'expired') {
      return { valid: false, error: 'Subscription has expired. Please renew to continue.' };
    }

    if (tenant.status === 'suspended') {
      return { valid: false, error: 'Account is suspended. Please contact support.' };
    }

    if (tenant.status === 'cancelled') {
      return { valid: false, error: 'Account has been cancelled.' };
    }

    // Check if current date is within subscription period
    const subscriptionStart = new Date(tenant.subscription_starts_at);
    const subscriptionEnd = new Date(tenant.subscription_ends_at);

    if (now < subscriptionStart) {
      return { valid: false, error: 'Subscription has not started yet' };
    }

    if (now > subscriptionEnd) {
      return { valid: false, error: 'Subscription has expired. Please renew to continue.' };
    }

    return { valid: true };
  }
  /**
   * Find current usage period entry based on tenant's subscription
   * Returns the actual usage entry with period dates instead of calculating them
   */
  private async findCurrentUsagePeriod(tenant: any): Promise<{
    periodStart: Date;
    periodEnd: Date;
    usageEntries: any[];
  }> {
    if (!tenant.subscription_starts_at) {
      throw new Error(`Tenant ${tenant.id} missing subscription_starts_at - cannot find usage period`);
    }

    // Find usage entries that match the tenant's subscription start date
    const usageEntries = await this.prisma.tenant_usage.findMany({
      where: {
        tenant_id: tenant.id,
        period_start: tenant.subscription_starts_at,
      },
      orderBy: {
        metric_type: 'asc',
      },
    });

    if (usageEntries.length === 0) {
      throw new Error(`No usage entries found for tenant ${tenant.id} with subscription start date ${tenant.subscription_starts_at.toISOString()}`);
    }

    // All usage entries should have the same period_start and period_end
    const firstEntry = usageEntries[0];
    
    return {
      periodStart: firstEntry.period_start,
      periodEnd: firstEntry.period_end,
      usageEntries,
    };
  }

  /**
   * Get specific usage entry for a metric
   */
  private async findUsageEntry(tenantId: string, metricType: UsageMetric): Promise<any | null> {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant || !tenant.subscription_starts_at) {
      throw new Error('Tenant or subscription_starts_at not found');
    }

    return await this.prisma.tenant_usage.findUnique({
      where: {
        tenant_id_metric_type_period_start: {
          tenant_id: tenantId,
          metric_type: metricType,
          period_start: tenant.subscription_starts_at,
        },
      },
    });
  }

  async checkUsageLimit(tenantId: string, metricType: UsageMetric): Promise<UsageLimitCheck> {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Validate subscription period
    const periodValidation = this.validateSubscriptionPeriod(tenant);
    if (!periodValidation.valid) {
      throw new Error(periodValidation.error || 'Subscription validation failed');
    }

    const limits = tenant.plan.limits as Record<string, number>;
    const limit = limits[metricType] ?? 0;
    const unlimited = limit === -1;

    // Find existing usage entry instead of calculating period
    let usage = await this.findUsageEntry(tenantId, metricType);

    if (!usage) {
      // If no usage entry exists, get period info and create one
      const { periodStart, periodEnd } = await this.findCurrentUsagePeriod(tenant);
      
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
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const limits = tenant.plan.limits as Record<string, number>;
    const limit = limits[metricType] ?? 0;
    
    // Use subscription_starts_at as period_start directly
    const periodStart = tenant.subscription_starts_at;
    const periodEnd = tenant.subscription_ends_at;

    if (!periodStart || !periodEnd) {
      throw new Error('Tenant missing subscription dates');
    }

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
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const periodStart = tenant.subscription_starts_at;
    if (!periodStart) {
      throw new Error('Tenant missing subscription_starts_at');
    }

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
    const periodStart = tenant.subscription_starts_at;

    if (!periodStart) {
      throw new Error('Tenant missing subscription_starts_at');
    }

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
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const periodStart = tenant.subscription_starts_at;
    if (!periodStart) {
      throw new Error('Tenant missing subscription_starts_at');
    }

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
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const periodStart = tenant.subscription_starts_at;
    if (!periodStart) {
      throw new Error('Tenant missing subscription_starts_at');
    }

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

    return tenants.map((tenant) => {
      const limits = tenant.plan.limits as Record<string, number>;
      const periodStart = tenant.subscription_starts_at;
      
      if (!periodStart) {
        return {
          tenantId: tenant.id,
          tenantName: tenant.name,
          planName: tenant.plan.name,
          metrics: {},
        };
      }
      
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
    const periodStart = tenant.subscription_starts_at;
    const periodEnd = tenant.subscription_ends_at;
    
    if (!periodStart || !periodEnd) {
      throw new Error('Tenant missing subscription dates');
    }

    // Count records created within the subscription period only
    const [candidatesCount, assessmentsCount, questionsCount] = await Promise.all([
      tenantPrisma.candidate.count({ 
        where: { 
          deleted_at: null,
          created_at: {
            gte: periodStart,
            lte: periodEnd,
          },
        } 
      }),
      tenantPrisma.assessments.count({ 
        where: { 
          deleted_at: null,
          created_at: {
            gte: periodStart,
            lte: periodEnd,
          },
        } 
      }),
      tenantPrisma.questions.count({ 
        where: { 
          deleted_at: null,
          created_at: {
            gte: periodStart,
            lte: periodEnd,
          },
        } 
      }),
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

  /**
   * Validate plan change and handle usage limit adjustments
   */
  async validatePlanChange(tenantId: string, newPlanId: string): Promise<{
    allowed: boolean;
    issues: string[];
    currentUsage: Record<string, number>;
    newLimits: Record<string, number>;
  }> {
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const newPlan = await this.prisma.plans.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan) {
      throw new Error('New plan not found');
    }

    const periodStart = tenant.subscription_starts_at;
    if (!periodStart) {
      throw new Error('Tenant missing subscription_starts_at');
    }
    
    const currentUsage = await this.prisma.tenant_usage.findMany({
      where: {
        tenant_id: tenantId,
        period_start: periodStart,
      },
    });

    const newLimits = newPlan.limits as Record<string, number>;
    const issues: string[] = [];
    const currentUsageMap: Record<string, number> = {};
    const newLimitsMap: Record<string, number> = {};

    // Check each metric
    Object.values(UsageMetric).forEach((metric) => {
      const usage = currentUsage.find(u => u.metric_type === metric);
      const current = usage?.current_value || 0;
      const newLimit = newLimits[metric] || 0;
      
      currentUsageMap[metric] = current;
      newLimitsMap[metric] = newLimit;

      // Check if current usage exceeds new limit (unless unlimited)
      if (newLimit !== -1 && current > newLimit) {
        issues.push(`Current ${metric} usage (${current}) exceeds new plan limit (${newLimit})`);
      }
    });

    return {
      allowed: issues.length === 0,
      issues,
      currentUsage: currentUsageMap,
      newLimits: newLimitsMap,
    };
  }

  /**
   * Apply plan change and update usage limits
   */
  async applyPlanChange(tenantId: string, newPlanId: string): Promise<void> {
    const validation = await this.validatePlanChange(tenantId, newPlanId);
    
    if (!validation.allowed) {
      throw new Error(`Plan change not allowed: ${validation.issues.join(', ')}`);
    }

    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const periodStart = tenant.subscription_starts_at;
    if (!periodStart) {
      throw new Error('Tenant missing subscription_starts_at');
    }

    const newLimits = validation.newLimits;

    // Update usage entry limits for current period
    for (const [metric, newLimit] of Object.entries(newLimits)) {
      await this.prisma.tenant_usage.updateMany({
        where: {
          tenant_id: tenantId,
          metric_type: metric as UsageMetric,
          period_start: periodStart,
        },
        data: {
          limit_value: newLimit,
        },
      });
    }
  }

  /**
   * Extend subscription end date and update existing usage entries
   */
  async extendSubscriptionEndDate(data: {
    tenantId: string;
    subscription_ends_at: Date;
  }) {
    console.log(`[Usage Service] Extending subscription end date for tenant: ${data.tenantId}`);
    
    try {
      const tenant = await this.prisma.tenants.findUnique({
        where: { id: data.tenantId },
        include: { plan: true },
      });

      if (!tenant) {
        throw new Error('Tenant not found');
      }

      if (!tenant.subscription_starts_at) {
        throw new Error('Tenant missing subscription_starts_at - cannot extend subscription');
      }

      // Update tenant subscription end date
      const updatedTenant = await this.prisma.tenants.update({
        where: { id: data.tenantId },
        data: { subscription_ends_at: data.subscription_ends_at },
        include: { plan: true },
      });

      console.log(`[Usage Service] Tenant subscription updated successfully`);

      // Update existing usage entries with new end date
      await this.updateUsageEntriesEndDate({
        tenantId: data.tenantId,
        newEndDate: data.subscription_ends_at,
      });

      console.log(`[Usage Service] ✅ Subscription extension completed successfully`);
      return updatedTenant;
    } catch (error: any) {
      console.error(`[Usage Service] ❌ Error extending subscription:`, error.message);
      throw error;
    }
  }

  /**
   * Update existing usage entries with new end date
   */
  private async updateUsageEntriesEndDate(data: {
    tenantId: string;
    newEndDate: Date;
  }) {
    console.log(`[Usage Service] Updating usage entries end date to: ${data.newEndDate.toISOString()}`);
    
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: data.tenantId },
      include: { plan: true },
    });

    if (!tenant || !tenant.subscription_starts_at) {
      throw new Error('Tenant or subscription_starts_at not found');
    }

    const periodStart = tenant.subscription_starts_at;
    if (!periodStart) {
      throw new Error('Tenant missing subscription_starts_at');
    }

    // Update all usage entries for current period with new end date
    const updateResult = await this.prisma.tenant_usage.updateMany({
      where: {
        tenant_id: data.tenantId,
        period_start: periodStart,
      },
      data: {
        period_end: data.newEndDate,
      },
    });

    console.log(`[Usage Service] Updated ${updateResult.count} usage entries with new end date`);
    return updateResult;
  }
}
