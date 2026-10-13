import { Router } from 'express';
import multer from 'multer';
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  downloadProtectedResource
} from '../controllers/resourceController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { env } from '../config/env.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024
  }
});

// Protected download accessible to authorized learners and admins
router.get('/:resourceId/download', requireAuth, downloadProtectedResource);

// Resource management endpoints (Admin only)
router.use(requireAdmin);

router.route('/')
  .get(getResources)
  .post(upload.single('file'), createResource);

router.route('/:resourceId')
  .get(getResourceById)
  .patch(updateResource)
  .delete(deleteResource);

export default router;
