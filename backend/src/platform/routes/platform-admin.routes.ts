import express from 'express';
import { PlatformAdminController } from '../controllers/platform-admin.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import { platformAdminSchema } from '../validations/platform-admin.validations';
import { asyncHandler } from '../../utils/asyncHandler';
import { platformAuth } from '../middlewares/platform-auth.middleware';

const router = express.Router();
const controller = new PlatformAdminController();

router.post(
  '/login',
  validateRequest(platformAdminSchema.login),
  asyncHandler(controller.login)
);

router.post('/logout', platformAuth(), asyncHandler(controller.logout));

router.get('/me', platformAuth(), asyncHandler(controller.me));

router.post(
  '/',
  platformAuth('admins.can_edit'),
  validateRequest(platformAdminSchema.create),
  asyncHandler(controller.create)
);

router.get(
  '/',
  platformAuth('admins.can_read'),
  asyncHandler(controller.list)
);

router.get(
  '/:id',
  platformAuth('admins.can_read'),
  validateRequest(platformAdminSchema.getById),
  asyncHandler(controller.getById)
);

router.put(
  '/:id',
  platformAuth('admins.can_edit'),
  validateRequest(platformAdminSchema.update),
  asyncHandler(controller.update)
);

router.delete(
  '/:id',
  platformAuth('admins.can_edit'),
  validateRequest(platformAdminSchema.delete),
  asyncHandler(controller.delete)
);

router.put(
  '/:id/password',
  platformAuth('admins.can_edit'),
  validateRequest(platformAdminSchema.changePassword),
  asyncHandler(controller.changePassword)
);

export default router;
