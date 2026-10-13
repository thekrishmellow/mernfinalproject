import { Router } from 'express';
import {
  createRoadmap,
  getRoadmaps,
  getRoadmapById,
  updateRoadmap,
  deleteRoadmap,
  saveDraft,
  publishRoadmap,
  duplicateRoadmap
} from '../controllers/roadmapController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createRoadmapSchema,
  updateRoadmapSchema,
  saveDraftSchema,
  publishRoadmapSchema
} from '../validators/roadmapValidator.js';

const router = Router();

router.use(requireAdmin);

router.route('/')
  .get(getRoadmaps)
  .post(validateRequest(createRoadmapSchema), createRoadmap);

router.route('/:roadmapId')
  .get(getRoadmapById)
  .patch(validateRequest(updateRoadmapSchema), updateRoadmap)
  .delete(deleteRoadmap);

router.put('/:roadmapId/draft', validateRequest(saveDraftSchema), saveDraft);
router.post('/:roadmapId/publish', validateRequest(publishRoadmapSchema), publishRoadmap);
router.post('/:roadmapId/duplicate', duplicateRoadmap);

export default router;
