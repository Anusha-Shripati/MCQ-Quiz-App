import express from 'express';
import { PlatformDashboardController } from '../controllers/platform-dashboard.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = express.Router();
const controller = new PlatformDashboardController();
router.get('/plan-distribution', asyncHandler(controller.getPlanTenantsData));
router.get('/tenant-growth', asyncHandler(controller.getTenantGrowthData));
// router.get('/platform-usage', asyncHandler(controller.getPlatformUsageData));

export default router;
