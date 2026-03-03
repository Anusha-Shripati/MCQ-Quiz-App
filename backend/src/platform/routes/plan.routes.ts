import express from 'express';
import { PlanController } from '../controllers/plan.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import { planSchema } from '../validations/plan.validations';
import { asyncHandler } from '../../utils/asyncHandler';
import { platformAuth } from '../middlewares/platform-auth.middleware';

const router = express.Router();
const controller = new PlanController();

// Public route (no auth required)
router.get('/public', asyncHandler(controller.listPublic));

router.post(
  '/',
  platformAuth('plans.can_edit'),
  validateRequest(planSchema.create),
  asyncHandler(controller.create)
);

router.get(
  '/',
  platformAuth('plans.can_read'),
  asyncHandler(controller.list)
);

router.get(
  '/:id',
  platformAuth('plans.can_read'),
  validateRequest(planSchema.getById),
  asyncHandler(controller.getById)
);

router.put(
  '/:id',
  platformAuth('plans.can_edit'),
  validateRequest(planSchema.update),
  asyncHandler(controller.update)
);

router.delete(
  '/:id',
  platformAuth('plans.can_edit'),
  validateRequest(planSchema.delete),
  asyncHandler(controller.delete)
);

router.put(
  '/:id/toggle',
  platformAuth('plans.can_edit'),
  validateRequest(planSchema.toggle),
  asyncHandler(controller.toggle)
);

router.get(
  '/:id/tenants',
  platformAuth('plans.can_read'),
  validateRequest(planSchema.getTenants),
  asyncHandler(controller.getTenants)
);

export default router;
