import express from 'express';
import platformAdminRoutes from './platform-admin.routes';
import planRoutes from './plan.routes';
import tenantRoutes from './tenant.routes';
import provisioningRoutes from './provisioning.routes';
import platformRoleRoutes from './platform-role.routes';
import platformModuleRoutes from './platform-module.routes';
import usageRoutes from './usage.routes';
import dashboardRoutes from './platform-dashboard.routes';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Platform API is running' });
});

router.use('/auth', platformAdminRoutes);
router.use('/admins', platformAdminRoutes);
router.use('/plans', planRoutes);
router.use('/tenants', tenantRoutes);
router.use('/provision', provisioningRoutes);
router.use('/roles', platformRoleRoutes);
router.use('/modules', platformModuleRoutes);
router.use('/usage', usageRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
