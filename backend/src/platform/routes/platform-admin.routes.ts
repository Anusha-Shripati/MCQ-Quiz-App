import express from 'express';
import { PlatformAdminController } from '../controllers/platform-admin.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import { platformAdminSchema } from '../validations/platform-admin.validations';
import { asyncHandler } from '../../utils/asyncHandler';
import { platformAuth } from '../middlewares/platform-auth.middleware';
import { upload } from '../../utils/fileUpload';

const router = express.Router();
const controller = new PlatformAdminController();

// Public routes (no auth required)
router.post('/login', validateRequest(platformAdminSchema.login), asyncHandler(controller.login));

router.post(
  '/validate-email',
  validateRequest(platformAdminSchema.validateEmail),
  asyncHandler(controller.validateEmail)
);

router.post(
  '/validate-otp',
  validateRequest(platformAdminSchema.validateOtp),
  asyncHandler(controller.validateOtp)
);

router.post(
  '/reset-password',
  validateRequest(platformAdminSchema.resetPassword),
  asyncHandler(controller.resetPassword)
);

// Protected routes (require auth)
router.get('/me', platformAuth('admins.can_read'), asyncHandler(controller.me));

router.post(
  '/create',
  platformAuth('admins.can_edit'),
  validateRequest(platformAdminSchema.create),
  asyncHandler(controller.create)
);

router.get('/list', platformAuth('admins.can_read'), asyncHandler(controller.list));

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
  '/change-password/:id',
  platformAuth('admins.can_edit'),
  validateRequest(platformAdminSchema.changePassword),
  asyncHandler(controller.changePassword)
);

router.put(
  '/upload-image/:id',
  platformAuth('admins.can_edit'),
  upload.single('file'),
  asyncHandler(controller.uploadImage)
);

export default router;
