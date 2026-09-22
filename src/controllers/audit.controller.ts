import { Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';
import { successResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuditLogsQuery } from '../validators/dashboard.validator';
import { getPaginationMeta } from '../utils/pagination';

export class AuditController {
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as AuditLogsQuery;

      const page = parseInt(query.page);
      const limit = parseInt(query.limit);

      const result = await auditService.getAuditLogs({
        page,
        limit,
        action: query.action,
        adminId: query.adminId,
        from: query.from,
        to: query.to,
      });

      successResponse(
        res,
        result.logs,
        'Audit logs retrieved successfully',
        200,
        getPaginationMeta(page, limit, result.total)
      );
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
