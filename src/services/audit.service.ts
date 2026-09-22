import { AuditAction } from '@prisma/client';
import { prisma } from '../config/database';

export interface AuditLogData {
  adminId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  async createLog(data: AuditLogData): Promise<void> {
    try {
      // Create audit log asynchronously without blocking the main flow
      await prisma.auditLog.create({
        data: {
          adminId: data.adminId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      // Log error but don't throw - audit logging should not break main operations
      console.error('Audit log creation failed:', error);
    }
  }

  async getAuditLogs(params: {
    page: number;
    limit: number;
    action?: string;
    adminId?: string;
    from?: string;
    to?: string;
  }) {
    const { page, limit, action, adminId, from, to } = params;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (adminId) {
      where.adminId = adminId;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          metadata: true,
          ipAddress: true,
          createdAt: true,
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }
}

export const auditService = new AuditService();
