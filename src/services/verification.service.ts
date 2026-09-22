import { EmployeeStatus, VerificationResult } from '@prisma/client';
import { prisma } from '../config/database';
import { uploadService } from './upload.service';

export interface VerificationResponse {
  valid: boolean;
  status: string;
  employee?: {
    employeeId: string;
    fullName: string;
    photoUrl: string | null;
    position: string;
    department: string;
    companyName: string;
    idGenerationDate: Date;
    idExpiryDate: Date;
  };
}

export class VerificationService {
  async verifyToken(
    token: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<VerificationResponse> {
    // Fast indexed lookup
    const employee = await prisma.employee.findUnique({
      where: {
        verificationToken: token,
      },
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        photoUrl: true,
        position: true,
        department: true,
        companyName: true,
        idGenerationDate: true,
        idExpiryDate: true,
        status: true,
        deletedAt: true,
      },
    });

    // If token doesn't exist or employee is deleted
    if (!employee || employee.deletedAt) {
      // Log verification attempt (fire and forget)
      if (employee && !employee.deletedAt) {
        this.logVerification(
          employee.id,
          VerificationResult.INVALID_TOKEN,
          ipAddress,
          userAgent
        );
      }

      return {
        valid: false,
        status: 'INVALID_ID',
      };
    }

    // Calculate effective status
    const now = new Date();
    let effectiveStatus: VerificationResult;
    let isValid = false;

    if (now > employee.idExpiryDate) {
      effectiveStatus = VerificationResult.EXPIRED;
    } else if (employee.status === EmployeeStatus.INACTIVE) {
      effectiveStatus = VerificationResult.INACTIVE;
    } else if (employee.status === EmployeeStatus.SUSPENDED) {
      effectiveStatus = VerificationResult.SUSPENDED;
    } else {
      effectiveStatus = VerificationResult.VALID;
      isValid = true;
    }

    // Log verification (fire and forget)
    this.logVerification(employee.id, effectiveStatus, ipAddress, userAgent);

    // Remove deletedAt from response
    const { deletedAt, ...employeeData } = employee;

    return {
      valid: isValid,
      status: effectiveStatus,
      employee: {
        ...employeeData,
        photoUrl: employeeData.photoUrl
          ? uploadService.getOptimizedImageUrl(
              employeeData.photoUrl,
              'medium'
            )
          : null,
      },
    };
  }

  private logVerification(
    employeeId: string,
    result: VerificationResult,
    ipAddress?: string,
    userAgent?: string
  ): void {
    // Async logging without blocking the verification response
    prisma.verificationLog
      .create({
        data: {
          employeeId,
          result,
          ipAddress,
          userAgent,
        },
      })
      .catch((error) => {
        console.error('Failed to create verification log:', error);
      });
  }

  async getVerificationLogs(params: {
    page: number;
    limit: number;
    employeeId?: string;
    result?: VerificationResult;
    from?: string;
    to?: string;
  }) {
    const { page, limit, employeeId, result, from, to } = params;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (result) {
      where.result = result;
    }

    if (from || to) {
      where.verifiedAt = {};
      if (from) {
        where.verifiedAt.gte = new Date(from);
      }
      if (to) {
        where.verifiedAt.lte = new Date(to);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.verificationLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { verifiedAt: 'desc' },
        select: {
          id: true,
          result: true,
          verifiedAt: true,
          ipAddress: true,
          employee: {
            select: {
              employeeId: true,
              fullName: true,
              department: true,
            },
          },
        },
      }),
      prisma.verificationLog.count({ where }),
    ]);

    return { logs, total };
  }
}

export const verificationService = new VerificationService();
