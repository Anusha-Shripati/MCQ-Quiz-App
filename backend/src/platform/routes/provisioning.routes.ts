import { Router } from 'express';
import { ProvisioningController } from '../controllers/provisioning.controller';
import { platformAuth } from '../middlewares/platform-auth.middleware';
import { validateRequest } from '../../middlewares/validation.middleware';
import { provisioningValidations } from '../validations/provisioning.validations';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const controller = new ProvisioningController();

router.post(
  '/',
  platformAuth('tenants.can_edit'),
  validateRequest({ body: provisioningValidations.provision }),
  asyncHandler(controller.provision)
);

export default router;
