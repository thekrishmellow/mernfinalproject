import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Readable } from 'stream';
import mongoose from 'mongoose';
import { env } from '../../config/env.js';

// Ensure uploads folder exists as local fallback
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

let gridFSBucket = null;

function getGridFS() {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    if (!gridFSBucket) {
      gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'pathfinder_cloud_uploads'
      });
    }
    return gridFSBucket;
  }
  return null;
}

export class StorageService {
  /**
   * Saves an uploaded file buffer to cloud storage (MongoDB Atlas GridFS) or local disk fallback
   */
  static async saveFile({ originalname, buffer, mimetype, size }) {
    const ext = path.extname(originalname).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(`File extension "${ext}" is not permitted. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }

    const uniqueId = crypto.randomBytes(16).toString('hex');
    const safeBaseName = path.basename(originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${uniqueId}_${safeBaseName}${ext}`;

    const bucket = getGridFS();

    // 1. Cloud Storage: MongoDB Atlas GridFS (persistent on Atlas cloud)
    if (env.STORAGE_ADAPTER === 'gridfs' && bucket) {
      return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
          contentType: mimetype,
          metadata: {
            originalname,
            sizeBytes: size,
            uploadedAt: new Date()
          }
        });

        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);

        readableStream
          .pipe(uploadStream)
          .on('error', (err) => {
            console.error('GridFS cloud upload error:', err);
            reject(err);
          })
          .on('finish', () => {
            console.log(`☁️ File uploaded to Atlas Cloud GridFS: ${filename} (${size} bytes)`);
            resolve({
              storageKey: filename,
              originalFilename: originalname,
              mimeType: mimetype,
              sizeBytes: size,
              storageAdapter: 'gridfs'
            });
          });
      });
    }

    // 2. Local disk fallback (for offline local development)
    const destinationPath = path.join(env.UPLOAD_DIR, filename);
    await fs.promises.writeFile(destinationPath, buffer);

    console.log(`💾 File saved to local storage: ${filename}`);
    return {
      storageKey: filename,
      originalFilename: originalname,
      mimeType: mimetype,
      sizeBytes: size,
      storageAdapter: 'local',
      filePath: destinationPath
    };
  }

  /**
   * Retrieves read stream for an authorized resource from Cloud GridFS or local storage
   */
  static async getFile(storageKey) {
    const bucket = getGridFS();

    // Check Cloud GridFS first
    if (bucket) {
      const files = await bucket.find({ filename: storageKey }).toArray();
      if (files && files.length > 0) {
        return {
          storageAdapter: 'gridfs',
          createReadStream: () => bucket.openDownloadStreamByName(storageKey)
        };
      }
    }

    // Check local disk fallback
    const sanitizedKey = path.basename(storageKey);
    const fullPath = path.join(env.UPLOAD_DIR, sanitizedKey);

    if (fs.existsSync(fullPath)) {
      return {
        storageAdapter: 'local',
        fullPath,
        createReadStream: () => fs.createReadStream(fullPath)
      };
    }

    throw new Error('Resource file not found on cloud or local storage.');
  }

  /**
   * Deletes a file from Cloud GridFS or local storage
   */
  static async deleteFile(storageKey) {
    try {
      const bucket = getGridFS();
      if (bucket) {
        const files = await bucket.find({ filename: storageKey }).toArray();
        for (const file of files) {
          await bucket.delete(file._id);
          console.log(`🗑️ Deleted file from Atlas Cloud GridFS: ${storageKey}`);
        }
      }

      // Also clean up local if exists
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
