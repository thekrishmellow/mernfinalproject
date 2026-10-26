import { app } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

let isConnecting = false;

export default async function handler(req, res) {
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
