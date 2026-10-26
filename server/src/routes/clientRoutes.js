import { Router } from 'express';
import {
  getClientDashboard,
  getAssignedRoadmap,
  getNodeWorkspace,
  updateResourceCompletion,
  updateTaskCompletion,
  startQuizAttempt,
  submitQuizAttempt,
  acceptAssignedRoadmap
} from '../controllers/clientLearningController.js';
import { requireAuth } from '../middleware/auth.js';
import { quizSubmissionLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/validate.js';
import { submitQuizAttemptSchema } from '../validators/quizValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', getClientDashboard);
router.post('/assignments/:assignmentId/accept', acceptAssignedRoadmap);
router.get('/assignments/:assignmentId/roadmap', getAssignedRoadmap);
router.get('/assignments/:assignmentId/nodes/:nodeId', getNodeWorkspace);

router.post('/assignments/:assignmentId/nodes/:nodeId/resources/:resourceId/complete', updateResourceCompletion);
router.post('/assignments/:assignmentId/nodes/:nodeId/tasks/:taskId/complete', updateTaskCompletion);

router.post('/assignments/:assignmentId/nodes/:nodeId/quiz/start', startQuizAttempt);
router.post(
  '/assignments/:assignmentId/nodes/:nodeId/quiz/attempts/:attemptId/submit',
  quizSubmissionLimiter,
  validateRequest(submitQuizAttemptSchema),
  submitQuizAttempt
);

export default router;
