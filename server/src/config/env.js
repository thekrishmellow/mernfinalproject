import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5001', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGO_URI: process.env.MONGO_URI || '', // If empty, auto-spawns mongodb-memory-server
  JWT_SECRET: process.env.JWT_SECRET || 'dev-super-secure-jwt-secret-key-at-least-32-chars-long!',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'dev-cookie-secret-key-random',
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'lax',
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '15', 10),
  STORAGE_ADAPTER: process.env.STORAGE_ADAPTER || 'gridfs', // 'gridfs' (Atlas Cloud), 'cloudinary', 's3', 'local'
  CLOUDINARY_URL: process.env.CLOUDINARY_URL || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'development', // 'development', 'smtp'
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'support@roadmaplearning.local',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@roadmap.local',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123456!'
};
