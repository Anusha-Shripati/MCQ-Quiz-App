import { Request, Response, NextFunction } from 'express';
import { UsageService } from '../services/usage.service';
import { UsageMetric } from '../../db/prisma/generated/client';
import { getPrisma } from '../../db/prisma/client';
import { generateResponse } from '../../utils/generateResponse';

const usageService = new UsageService(getPrisma());

export const enforceUsageLimit = (metricType: UsageMetric) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = req.context?.tenant?.id;

      if (!tenantId) {
        generateResponse(res, 400, {}, false, 'Tenant context not found');
        return;
      }

      const check = await usageService.checkUsageLimit(tenantId, metricType);

      if (!check.allowed) {
        generateResponse(
          res,
          403,
          {
            current: check.current,
            limit: check.limit,
            upgradeRequired: true,
          },
          false,
          `${metricType} limit reached (${check.current}/${check.limit}). Please upgrade your plan.`,
          'USAGE_LIMIT_EXCEEDED'
        );
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
