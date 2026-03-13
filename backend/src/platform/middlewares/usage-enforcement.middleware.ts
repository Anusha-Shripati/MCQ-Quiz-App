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
      const tenantName = req.context?.tenant?.name;
      const planName = req.context?.tenant?.plan?.name;

      if (!tenantId) {
        generateResponse(res, 400, {}, false, 'Tenant context not found');
        return;
      }

      const check = await usageService.checkUsageLimit(tenantId, metricType);

      if (!check.allowed) {
        const errorData = {
          current: check.current,
          limit: check.limit,
          unlimited: check.unlimited,
          metricType,
          tenantName,
          planName,
          upgradeRequired: true,
          suggestedActions: [
            'Upgrade to a higher plan',
            'Delete unused items to free up space',
            'Contact support for assistance'
          ]
        };

        const errorMessage = check.unlimited 
          ? `System error: Unlimited plan should not have limits`
          : `${metricType} limit reached (${check.current}/${check.limit}). Please upgrade your plan or delete unused items.`;

        generateResponse(
          res,
          403,
          errorData,
          false,
          errorMessage,
          'USAGE_LIMIT_EXCEEDED'
        );
        return;
      }

      next();
    } catch (error: any) {
      // Handle specific usage service errors
      if (error.message.includes('Tenant not found')) {
        generateResponse(res, 404, {}, false, 'Tenant not found', 'TENANT_NOT_FOUND');
        return;
      }

      if (error.message.includes('subscription')) {
        generateResponse(res, 403, {}, false, 'Subscription expired or invalid. Please renew your subscription.', 'SUBSCRIPTION_EXPIRED');
        return;
      }

      if (error.message.includes('period')) {
        generateResponse(res, 500, {}, false, 'Billing period mismatch. Please contact support.', 'PERIOD_MISMATCH');
        return;
      }

      // Generic error
      console.error('Usage enforcement error:', error);
      generateResponse(res, 500, {}, false, 'Usage validation failed. Please try again or contact support.', 'USAGE_VALIDATION_ERROR');
    }
  };
};
