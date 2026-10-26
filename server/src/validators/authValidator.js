import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Valid email address is required').toLowerCase().trim(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['admin', 'client']).optional()
  })
};

export const magicLoginSchema = {
  body: z.object({
    email: z.string().email('Valid email address is required').toLowerCase().trim(),
    role: z.enum(['admin', 'client']).optional()
  })
};

export const verifyMagicLoginSchema = {
  body: z.object({
    token: z.string().min(10, 'Login token is required')
  })
};

export const loginSchema = {
  body: z.object({
    email: z.string().email('Valid email address is required').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required')
  })
};

export const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email('Valid email address is required').toLowerCase().trim()
  })
};

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(10, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
};

export const acceptInvitationSchema = {
  body: z.object({
    token: z.string().min(10, 'Invitation token is required'),
    name: z.string().min(2, 'Name is required'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
};
