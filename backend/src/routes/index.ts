//library imports
import express from 'express';
import { tenantResolver, platformResolver } from '../middlewares/tenant-resolver.middleware';
import tenantRoutes from '../tenant/routes';
import platformRoutes from '../platform/routes';

const router = express.Router();

// Platform routes (admin.lr-mcq.com) - No tenant resolution needed
router.use('/platform', platformResolver, platformRoutes);

// Tenant routes (*.lr-mcq.com) - Requires tenant resolution
router.use('/', tenantResolver, tenantRoutes);

export default router;
