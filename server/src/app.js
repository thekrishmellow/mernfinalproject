import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { EmailService } from './services/email/emailService.js';

import authRoutes from './routes/authRoutes.js';
import adminRoadmapRoutes from './routes/adminRoadmapRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

export const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false // Disabled for local dev flexibility with Vite dev server
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (
        origin === env.CLIENT_URL ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

// Healthcheck
app.get(['/health', '/api/health', '/api/v1/health'], (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

// Dev-only helper to inspect captured emails
if (env.NODE_ENV !== 'production') {
  app.get('/api/v1/dev/emails', (req, res) => {
    res.json({ emails: EmailService.getCapturedEmails() });
  });
}

// Global API rate limiting
app.use('/api', apiLimiter);

// API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin/roadmaps', adminRoadmapRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/client', clientRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handler
app.use(errorHandler);
