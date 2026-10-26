import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyInvitationToken,
  acceptInvitation,
  requestMagicLogin,
  verifyMagicLogin,
  googleAuth
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  acceptInvitationSchema,
  magicLoginSchema,
  verifyMagicLoginSchema
} from '../validators/authValidator.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/google', authLimiter, googleAuth);
router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/magic-login/request', authLimiter, validateRequest(magicLoginSchema), requestMagicLogin);
router.post('/magic-login/verify', authLimiter, validateRequest(verifyMagicLoginSchema), verifyMagicLogin);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), resetPassword);
router.get('/invitations/:token', verifyInvitationToken);
router.post('/invitations/accept', authLimiter, validateRequest(acceptInvitationSchema), acceptInvitation);

export default router;

