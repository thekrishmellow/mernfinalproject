import { app } from '../src/app.js';
import { connectDB } from '../src/config/db.js';

let connPromise = null;

async function ensureDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  if (!connPromise) {
    connPromise = connectDB().catch((err) => {
      connPromise = null;
      throw err;
    });
  }
  await connPromise;
}

export default async function handler(req, res) {
  try {
    await ensureDB();
  } catch (dbErr) {
    console.error('Database connection failed in serverless handler:', dbErr.message);
    return res.status(503).json({
      success: false,
      message: 'Database is currently unreachable. Please check your MongoDB Atlas cluster.',
      error: dbErr.message
    });
  }

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


