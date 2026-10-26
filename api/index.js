import { app } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

let connPromise = null;

async function ensureDB() {
  if (!connPromise) {
    connPromise = connectDB().catch((err) => {
      connPromise = null;
      console.error('MongoDB connection error in serverless handler:', err.message);
    });
  }
  return connPromise;
}

export default async function handler(req, res) {
  await ensureDB();
  return app(req, res);
}

