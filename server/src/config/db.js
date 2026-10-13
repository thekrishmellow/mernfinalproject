import mongoose from 'mongoose';
import { env } from './env.js';

let mongodInstance = null;

export async function connectDB() {
  try {
    let uri = env.MONGO_URI;

    if (!uri) {
      console.log('⚡ MONGO_URI not provided. Starting in-memory MongoDB server for zero-config development...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'personalized_roadmap'
        }
      });
      uri = mongodInstance.getUri();
      console.log(`✅ In-memory MongoDB running at: ${uri}`);
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);

    console.log(`✅ MongoDB connected successfully to ${mongoose.connection.host || 'in-memory instance'}`);
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (!mongodInstance) {
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
