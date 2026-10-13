import { Router } from 'express';
import multer from 'multer';
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  importQuestions,
  extractFromDocument
} from '../controllers/quizController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createQuizSchema } from '../validators/quizValidator.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.use(requireAdmin);

router.route('/')
  .get(getQuizzes)
  .post(validateRequest(createQuizSchema), createQuiz);

router.post('/import', importQuestions);
router.post('/extract-document', upload.single('document'), extractFromDocument);

router.route('/:quizId')
  .get(getQuizById)
  .patch(updateQuiz)
  .delete(deleteQuiz);

export default router;
