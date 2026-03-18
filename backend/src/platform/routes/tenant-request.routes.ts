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
adminRouter.get('/', platformAuth('tenants.can_read'), asyncHandler(controller.list));
adminRouter.post('/:id/approve', platformAuth('tenants.can_edit'), asyncHandler(controller.approveRequest));
adminRouter.post('/:id/reject', platformAuth('tenants.can_edit'), validateRequest({ body: rejectRequestValidation }), asyncHandler(controller.rejectRequest));
adminRouter.post('/:id/reset-to-pending', platformAuth('tenants.can_edit'), asyncHandler(controller.resetToPending));
adminRouter.delete('/:id', platformAuth('tenants.can_edit'), asyncHandler(controller.deleteRequest));

router.use('/admin', adminRouter);

export default router;