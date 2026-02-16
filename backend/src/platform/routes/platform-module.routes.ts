import express from 'express';
import { PlatformModuleController } from '../controllers/platform-module.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { platformAuth } from '../middlewares/platform-auth.middleware';

const router = express.Router();
const controller = new PlatformModuleController();

router.get(
  '/list',
  platformAuth('modules.can_read'),
  asyncHandler(controller.get)
);

export default router;
