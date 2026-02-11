import express from 'express';

const router = express.Router();

// TODO: Add platform admin routes in Phase 3
// - Tenant management
// - Plan management
// - Platform admin authentication
// - Usage tracking

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Platform API is running' });
});

export default router;
