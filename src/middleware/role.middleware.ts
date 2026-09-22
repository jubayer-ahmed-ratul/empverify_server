import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { errorResponse } from '../utils/response';
import { AdminRole } from '@prisma/client';

export const requireRole = (...roles: AdminRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    if (!roles.includes(req.admin.role as AdminRole)) {
      errorResponse(res, 'Forbidden: Insufficient permissions', 403);
      return;
    }

    next();
  };
};
