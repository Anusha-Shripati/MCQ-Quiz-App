import { Router } from 'express';
import { TenantRequestController } from '../controllers/tenant-request.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import { platformAuth } from '../middlewares/platform-auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  createTenantRequestValidation,
  checkSlugValidation,
  checkOrganizationValidation,
  checkStatusValidation,
  cancelRequestValidation,
  rejectRequestValidation
} from '../validations/tenant-request.validations';

const router = Router();
const controller = new TenantRequestController();

// Public routes (no auth required)
router.post('/', validateRequest({ body: createTenantRequestValidation }), asyncHandler(controller.create));
router.post('/check-slug', validateRequest({ body: checkSlugValidation }), asyncHandler(controller.checkSlug));
router.post('/check-organization', validateRequest({ body: checkOrganizationValidation }), asyncHandler(controller.checkOrganization));
router.post('/status', validateRequest({ body: checkStatusValidation }), asyncHandler(controller.checkStatus));
router.delete('/', validateRequest({ body: cancelRequestValidation }), asyncHandler(controller.cancelRequest));

// Admin routes (auth required)
const adminRouter = Router();
adminRouter.get('/', platformAuth(), asyncHandler(controller.list));
adminRouter.post('/:id/approve', platformAuth(), asyncHandler(controller.approveRequest));
adminRouter.post('/:id/reject', platformAuth(), validateRequest({ body: rejectRequestValidation }), asyncHandler(controller.rejectRequest));

router.use('/admin', adminRouter);

export default router;