import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { errorResponse } from '../utils/response';
import { env } from '../config/env';

export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', error);

  // Multer errors
  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      errorResponse(res, 'File size too large. Maximum size is 5MB.', 400);
      return;
    }
    errorResponse(res, `Upload error: ${error.message}`, 400);
    return;
  }

  // Custom multer filter errors
  if (error.message && error.message.includes('Invalid file type')) {
    errorResponse(res, error.message, 400);
    return;
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = (error.meta?.target as string[])?.join(', ') || 'field';
        errorResponse(res, `${field} already exists`, 409);
        return;
      case 'P2025':
        // Record not found
        errorResponse(res, 'Record not found', 404);
        return;
      case 'P2003':
        // Foreign key constraint violation
        errorResponse(res, 'Related record not found', 400);
        return;
      default:
        errorResponse(res, 'Database error occurred', 500);
        return;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    errorResponse(res, 'Invalid data provided', 400);
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    errorResponse(res, 'Invalid token', 401);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    errorResponse(res, 'Token expired', 401);
    return;
  }

  // Default error
  const message =
    env.NODE_ENV === 'development'
      ? error.message || 'Internal server error'
      : 'Internal server error';

  errorResponse(res, message, error.statusCode || 500);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};
