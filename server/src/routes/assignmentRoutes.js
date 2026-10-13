import { Router } from 'express';
import {
  assignRoadmap,
  bulkAssignRoadmap,
  getAssignments,
  revokeAssignment,
  resendInvitation
} from '../controllers/assignmentController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { assignSingleClientSchema, bulkAssignSchema } from '../validators/assignmentValidator.js';

const router = Router();

router.use(requireAdmin);

router.route('/')
  .get(getAssignments)
  .post(validateRequest(assignSingleClientSchema), assignRoadmap);

router.post('/bulk', validateRequest(bulkAssignSchema), bulkAssignRoadmap);
router.post('/:assignmentId/revoke', revokeAssignment);
router.post('/:assignmentId/resend-invitation', resendInvitation);

export default router;
