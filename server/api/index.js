import { app } from '../src/app.js';
import { connectDB } from '../src/config/db.js';

let isConnecting = false;

export default async function handler(req, res) {
  // Ensure DB connection is established
  if (!isConnecting) {
    isConnecting = true;
    try {
      await connectDB();
    } catch (err) {
      console.error('MongoDB connection error in serverless handler:', err.message);
    } finally {
      isConnecting = false;
    }
  }

  return app(req, res);
}
