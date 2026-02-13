import express from 'express';
import platformAdminRoutes from './platform-admin.routes';
import planRoutes from './plan.routes';
import tenantRoutes from './tenant.routes';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Platform API is running' });
});

router.use('/auth', platformAdminRoutes);
router.use('/admins', platformAdminRoutes);
router.use('/plans', planRoutes);
router.use('/tenants', tenantRoutes);

export default router;
