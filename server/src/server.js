import { app } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { seedInitialData } from './utils/seed.js';

async function startServer() {
  try {
    await connectDB();

    // Auto-seed admin and sample roadmap if database is empty
    await seedInitialData();

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Pathfinder Server running on http://localhost:${env.PORT}`);
      console.log(`📡 Client URL: ${env.CLIENT_URL}`);
      console.log(`⚙️  Environment: ${env.NODE_ENV}`);
    });

    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDB();
        console.log('✅ Server and database disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
