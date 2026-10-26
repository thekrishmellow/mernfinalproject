import { app } from '../src/app.js';
import { connectDB } from '../src/config/db.js';

let isConnecting = false;

async function ensureDB() {
  if (isConnecting) return;
  isConnecting = true;
  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  } finally {
    isConnecting = false;
  }
}

// Cold start connection
ensureDB();

export default async function handler(req, res) {
  await ensureDB();
  return app(req, res);
}
