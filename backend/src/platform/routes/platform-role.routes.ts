import express from 'express';
import { PlatformRoleController } from '../controllers/platform-role.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import { platformRoleSchema } from '../validations/platform-role.validations';
import { asyncHandler } from '../../utils/asyncHandler';
import { platformAuth } from '../middlewares/platform-auth.middleware';

const router = express.Router();
const controller = new PlatformRoleController();

router.post(
  '/create',
  platformAuth('roles.can_edit'),
  validateRequest(platformRoleSchema.create),
  asyncHandler(controller.create)
);

router.put(
  '/:id',
  platformAuth('roles.can_edit'),
  validateRequest(platformRoleSchema.update),
  asyncHandler(controller.update)
);

router.get(
  '/list',
  platformAuth('roles.can_read'),
  asyncHandler(controller.get)
);

router.get(
  '/:id',
  platformAuth('roles.can_read'),
  validateRequest(platformRoleSchema.getById),
  asyncHandler(controller.getById)
);

router.delete(
  '/:id',
  platformAuth('roles.can_edit'),
  validateRequest(platformRoleSchema.delete),
  asyncHandler(controller.delete)
);

export default router;
