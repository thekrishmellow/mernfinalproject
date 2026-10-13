import { verifyToken } from '../utils/token.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

export const AUTH_COOKIE_NAME = 'auth_token';

export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

export function clearAuthCookie(res) {
  res.cookie(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    expires: new Date(0)
  });
}

export async function authenticate(req, res, next) {
  try {
    let token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      clearAuthCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please log in again.'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.'
      });
    }

    if (user.accountStatus === 'suspended') {
      clearAuthCookie(res);
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication check failed.'
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You lack the necessary permissions for this resource.'
      });
    }

    next();
  };
}

export const requireAdmin = [authenticate, requireRole('admin')];
export const requireClient = [authenticate, requireRole('client')];
export const requireAuth = [authenticate];
