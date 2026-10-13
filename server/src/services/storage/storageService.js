import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../../config/env.js';

// Ensure uploads folder exists
if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
  'image/jpeg',
  'image/png',
  'image/webp'
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.md', '.json', '.jpg', '.jpeg', '.png', '.webp'];

export class StorageService {
  /**
   * Saves an uploaded file buffer or stream to the storage backend
   */
  static async saveFile({ originalname, buffer, mimetype, size }) {
    const ext = path.extname(originalname).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(`File extension "${ext}" is not permitted. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }

    const uniqueId = crypto.randomBytes(16).toString('hex');
    const safeBaseName = path.basename(originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${uniqueId}_${safeBaseName}${ext}`;
    const destinationPath = path.join(env.UPLOAD_DIR, filename);

    await fs.promises.writeFile(destinationPath, buffer);

    return {
      storageKey: filename,
      originalFilename: originalname,
      mimeType: mimetype,
      sizeBytes: size,
      filePath: destinationPath
    };
  }

  /**
   * Retrieves read stream or path for an authorized resource
   */
  static async getFile(storageKey) {
    // Prevent directory traversal attacks
    const sanitizedKey = path.basename(storageKey);
    const fullPath = path.join(env.UPLOAD_DIR, sanitizedKey);

    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found on storage.');
    }

    return {
      fullPath,
      createReadStream: () => fs.createReadStream(fullPath)
    };
  }

  /**
   * Deletes a file from storage
   */
  static async deleteFile(storageKey) {
    try {
      const sanitizedKey = path.basename(storageKey);
      const fullPath = path.join(env.UPLOAD_DIR, sanitizedKey);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
    } catch (err) {
      console.warn(`Failed to delete file ${storageKey}:`, err.message);
    }
  }
}
