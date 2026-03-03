import express from 'express';
import { UsageController } from '../controllers/usage.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import { usageValidations } from '../validations/usage.validations';
import { asyncHandler } from '../../utils/asyncHandler';
import { platformAuth } from '../middlewares/platform-auth.middleware';

const router = express.Router();
const controller = new UsageController();

router.get(
  '/summary',
  platformAuth('usage.can_read'),
  asyncHandler(controller.getSummary)
);

router.get(
  '/:tenantId',
  platformAuth('usage.can_read'),
  validateRequest(usageValidations.getUsageStats),
  asyncHandler(controller.getUsageStats)
);

router.get(
  '/:tenantId/:metric',
  platformAuth('usage.can_read'),
  validateRequest(usageValidations.getMetricUsage),
  asyncHandler(controller.getMetricUsage)
);

router.put(
  '/:tenantId/:metric/reset',
  platformAuth('usage.can_edit'),
  validateRequest(usageValidations.resetMetric),
  asyncHandler(controller.resetMetric)
);

router.post(
  '/:tenantId/sync',
  platformAuth('usage.can_edit'),
  validateRequest(usageValidations.syncUsage),
  asyncHandler(controller.syncUsage)
);

export default router;
