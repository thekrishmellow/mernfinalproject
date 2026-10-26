import mongoose from 'mongoose';
import { env } from './env.js';

let mongodInstance = null;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    let uri = env.MONGO_URI;

    if (process.env.NODE_ENV === 'test' || (!uri && !process.env.VERCEL)) {
      if (!mongodInstance) {
        console.log('⚡ Starting in-memory MongoDB server for testing/development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create({
          instance: {
            dbName: 'personalized_roadmap'
          }
        });
      }
      uri = mongodInstance.getUri();
      console.log(`✅ In-memory MongoDB running at: ${uri}`);
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

    console.log(`✅ MongoDB connected successfully to ${mongoose.connection.host || 'in-memory instance'}`);
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (!mongodInstance && !process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      console.log('🔄 Attempting fallback to in-memory MongoDB...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create({
          instance: {
            dbName: 'personalized_roadmap'
          }
        });
        const fallbackUri = mongodInstance.getUri();
        await mongoose.connect(fallbackUri);
        console.log(`✅ Fallback in-memory MongoDB connected at: ${fallbackUri}`);
        return mongoose.connection;
      } catch (fallbackError) {
        console.error('❌ Failed to start fallback MongoDB:', fallbackError.message);
        throw fallbackError;
      }
    }
    throw error;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
      mongodInstance = null;
    }
  } catch (err) {
    console.error('Error disconnecting DB:', err.message);
  }
}
