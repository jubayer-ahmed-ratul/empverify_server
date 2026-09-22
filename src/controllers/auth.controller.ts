import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { LoginInput } from '../validators/auth.validator';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as LoginInput;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(input, ipAddress, userAgent);

      successResponse(res, result, 'Login successful', 200);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        errorResponse(res, 'Invalid email or password', 401);
        return;
      }
      next(error);
    }
  }

  async logout(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // For JWT, logout is handled client-side by removing the token
      // Optionally create audit log
      successResponse(res, null, 'Logout successful', 200);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin) {
        errorResponse(res, 'Unauthorized', 401);
        return;
      }

      const profile = await authService.getProfile(req.admin.id);
      successResponse(res, profile, 'Profile retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
