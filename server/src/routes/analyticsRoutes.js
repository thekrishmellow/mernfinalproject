import { Router } from 'express';
import { getAdminAnalytics, getRoadmapAnalytics } from '../controllers/analyticsController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

router.get('/dashboard', getAdminAnalytics);
router.get('/roadmaps/:roadmapId', getRoadmapAnalytics);

export default router;
