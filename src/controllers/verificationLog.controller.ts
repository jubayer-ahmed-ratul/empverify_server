import { Response, NextFunction } from 'express';
import { verificationService } from '../services/verification.service';
import { successResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { VerificationLogsQuery } from '../validators/dashboard.validator';
import { getPaginationMeta } from '../utils/pagination';

export class VerificationLogController {
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as VerificationLogsQuery;

      const page = parseInt(query.page);
      const limit = parseInt(query.limit);

      const result = await verificationService.getVerificationLogs({
        page,
        limit,
        employeeId: query.employeeId,
        result: query.result,
        from: query.from,
        to: query.to,
      });

      successResponse(
        res,
        result.logs,
        'Verification logs retrieved successfully',
        200,
        getPaginationMeta(page, limit, result.total)
      );
    } catch (error) {
      next(error);
    }
  }
}

export const verificationLogController = new VerificationLogController();
