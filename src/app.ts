import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { successResponse } from './utils/response';

// Import routes
import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employee.routes';
import verificationRoutes from './routes/verification.routes';
import dashboardRoutes from './routes/dashboard.routes';
import verificationLogRoutes from './routes/verificationLog.routes';
import auditRoutes from './routes/audit.routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Compression
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (for accurate IP addresses behind proxies)
app.set('trust proxy', 1);

// Health check - no rate limit
app.get('/api/health', (req: Request, res: Response) => {
  successResponse(res, { status: 'healthy' }, 'Service is healthy', 200);
});

// Health check with database
app.get('/api/health/db', async (req: Request, res: Response) => {
  try {
    const { prisma } = await import('./config/database');
    await prisma.$queryRaw`SELECT 1`;
    successResponse(
      res,
      { status: 'healthy', database: 'connected' },
      'Service and database are healthy',
      200
    );
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database connection failed',
    });
  }
});

// Routes (no rate limiting middleware to avoid type conflicts)
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/verification-logs', verificationLogRoutes);
app.use('/api/audit-logs', auditRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
