import { z } from 'zod';
import { VerificationResult } from '@prisma/client';

export const verificationLogsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    employeeId: z.string().optional(),
    result: z.nativeEnum(VerificationResult).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const auditLogsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    action: z.string().optional(),
    adminId: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export type VerificationLogsQuery = z.infer<typeof verificationLogsSchema>['query'];
export type AuditLogsQuery = z.infer<typeof auditLogsSchema>['query'];
