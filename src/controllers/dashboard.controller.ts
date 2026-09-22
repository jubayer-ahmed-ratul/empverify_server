import { Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { successResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export class DashboardController {
  async getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await dashboardService.getSummary();
      successResponse(res, summary, 'Dashboard summary retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async getRecentEmployees(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const employees = await dashboardService.getRecentEmployees(limit);
      successResponse(res, employees, 'Recent employees retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async getRecentVerifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const verifications = await dashboardService.getRecentVerifications(limit);
      successResponse(res, verifications, 'Recent verifications retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async getVerificationStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getVerificationStats();
      successResponse(res, stats, 'Verification statistics retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getDepartmentStats();
      successResponse(res, stats, 'Department statistics retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
