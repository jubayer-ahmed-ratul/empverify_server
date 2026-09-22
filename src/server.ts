import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';

const PORT = parseInt(env.PORT) || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🚀 EmpVerify Backend Server                           ║
║                                                            ║
║     Environment: ${env.NODE_ENV.padEnd(43)}║
║     Port:        ${PORT.toString().padEnd(43)}║
║     URL:         ${env.APP_URL.padEnd(43)}║
║                                                            ║
║     Ready to accept requests! 🎉                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('HTTP server closed');

        await prisma.$disconnect();
        console.log('Database connection closed');

        console.log('Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
