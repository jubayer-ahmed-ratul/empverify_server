import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { errorResponse } from '../utils/response';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponse(res, 'No token provided', 401);
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);

      // Verify admin still exists
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true },
      });

      if (!admin) {
        errorResponse(res, 'Invalid token', 401);
        return;
      }

      req.admin = {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      };

      next();
    } catch (error) {
      errorResponse(res, 'Invalid or expired token', 401);
      return;
    }
  } catch (error) {
    errorResponse(res, 'Authentication failed', 401);
  }
};
