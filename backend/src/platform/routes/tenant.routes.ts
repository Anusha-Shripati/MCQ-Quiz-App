import express from 'express';
import { TenantController } from '../controllers/tenant.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import { tenantSchema } from '../validations/tenant.validations';
import { asyncHandler } from '../../utils/asyncHandler';
import { platformAuth } from '../middlewares/platform-auth.middleware';

const router = express.Router();
const controller = new TenantController();

router.post(
  '/',
  platformAuth('tenants.can_edit'),
  validateRequest(tenantSchema.create),
  asyncHandler(controller.create)
);

router.get(
  '/',
  platformAuth('tenants.can_read'),
  asyncHandler(controller.list)
);

router.get(
  '/:id',
  platformAuth('tenants.can_read'),
  validateRequest(tenantSchema.getById),
  asyncHandler(controller.getById)
);

router.put(
  '/:id',
  platformAuth('tenants.can_edit'),
  validateRequest(tenantSchema.update),
  asyncHandler(controller.update)
);

router.delete(
  '/:id',
  platformAuth('tenants.can_edit'),
  validateRequest(tenantSchema.delete),
  asyncHandler(controller.delete)
);

router.put(
  '/:id/status',
  platformAuth('tenants.can_edit'),
  validateRequest(tenantSchema.updateStatus),
  asyncHandler(controller.updateStatus)
);

router.put(
  '/:id/subscription',
  platformAuth('tenants.can_edit'),
  validateRequest(tenantSchema.updateSubscription),
  asyncHandler(controller.updateSubscription)
);

router.get(
  '/:id/usage',
  platformAuth('tenants.can_read'),
  validateRequest(tenantSchema.getUsage),
  asyncHandler(controller.getUsage)
);

export default router;
