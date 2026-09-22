import { Request, Response, NextFunction } from 'express';
import { verificationService } from '../services/verification.service';
import { successResponse } from '../utils/response';

export class VerificationController {
  async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { verificationToken } = req.params;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await verificationService.verifyToken(
        verificationToken,
        ipAddress,
        userAgent
      );

      successResponse(res, result, 'Verification completed', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const verificationController = new VerificationController();
