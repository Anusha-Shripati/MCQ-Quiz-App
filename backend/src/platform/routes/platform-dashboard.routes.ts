import express from 'express';
import { PlatformDashboardController } from '../controllers/platform-dashboard.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { platformAuth } from '../middlewares/platform-auth.middleware';

const router = express.Router();
const controller = new PlatformDashboardController();
router.get('/plan-distribution', platformAuth(), asyncHandler(controller.getPlanTenantsData));
router.get('/tenant-growth', platformAuth(), asyncHandler(controller.getTenantGrowthData));
// router.get('/platform-usage', asyncHandler(controller.getPlatformUsageData));

export default router;
