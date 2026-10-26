import { app } from '../src/app.js';
import { connectDB } from '../src/config/db.js';

let connPromise = null;

async function ensureDB() {
  if (!connPromise) {
    connPromise = connectDB().catch((err) => {
      connPromise = null;
      console.error('MongoDB connection error:', err.message);
    });
  }
  return connPromise;
}

export default async function handler(req, res) {
  await ensureDB();
  return new Promise((resolve, reject) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    res.on('error', reject);
    app(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}


