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

export default router;
