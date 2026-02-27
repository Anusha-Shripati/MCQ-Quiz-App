import { Request, Response, NextFunction } from 'express';
import { UsageService } from '../services/usage.service';
import { generateResponse } from '../../utils/generateResponse';
import { getPrisma } from '../../db/prisma/client';
import { UsageMetric } from '../../db/prisma/generated/client';

export class UsageController {
  private usageService: UsageService;

  constructor() {
    this.usageService = new UsageService(getPrisma());
  }

  getUsageStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tenantId } = req.params;
      const stats = await this.usageService.getUsageStats(tenantId);
      generateResponse(res, 200, stats, true, 'Usage statistics fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  getMetricUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tenantId, metric } = req.params;
      const current = await this.usageService.getCurrentUsage(tenantId, metric as UsageMetric);
      const check = await this.usageService.checkUsageLimit(tenantId, metric as UsageMetric);

      generateResponse(
        res,
        200,
        {
          metric,
          current,
          limit: check.limit,
          unlimited: check.unlimited,
          percentage: check.unlimited ? 0 : check.limit > 0 ? Math.round((current / check.limit) * 100) : 0,
        },
        true,
        'Metric usage fetched successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  resetMetric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tenantId, metric } = req.params;
      await this.usageService.resetUsage(tenantId, metric as UsageMetric);
      generateResponse(res, 200, {}, true, `${metric} usage reset successfully`);
    } catch (error) {
      next(error);
    }
  };

  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.usageService.getAllTenantsUsage();
      generateResponse(res, 200, summary, true, 'Usage summary fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  syncUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tenantId } = req.params;
      
      const tenant = await getPrisma().tenants.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        generateResponse(res, 404, {}, false, 'Tenant not found');
        return;
      }

      try {
        const { getTenantPrisma } = await import('../../db/tenant/client');
        const tenantPrisma = getTenantPrisma(tenantId, tenant.db_url);

        await this.usageService.syncUsageFromDatabase(tenantId, tenantPrisma);
        const stats = await this.usageService.getUsageStats(tenantId);

        generateResponse(res, 200, stats, true, 'Usage synced successfully');
      } catch (syncError: any) {
        console.error('Sync error:', syncError);
        generateResponse(res, 500, {}, false, `Failed to sync usage: ${syncError.message}`);
      }
    } catch (error) {
      next(error);
    }
  };
}
