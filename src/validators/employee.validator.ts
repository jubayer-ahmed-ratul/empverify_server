import { z } from 'zod';
import { EmployeeStatus } from '@prisma/client';

export const createEmployeeSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    position: z.string().min(1, 'Position is required'),
    department: z.string().min(1, 'Department is required'),
    companyName: z.string().min(1, 'Company name is required'),
    joiningDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid joining date',
    }),
    idExpiryDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid expiry date',
    }),
  }),
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, 'Full name is required').optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    position: z.string().min(1, 'Position is required').optional(),
    department: z.string().min(1, 'Department is required').optional(),
    companyName: z.string().min(1, 'Company name is required').optional(),
    joiningDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid joining date',
      })
      .optional(),
    idExpiryDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid expiry date',
      })
      .optional(),
    status: z.nativeEnum(EmployeeStatus).optional(),
  }),
});

export const employeeListSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    search: z.string().optional(),
    status: z.nativeEnum(EmployeeStatus).optional(),
    department: z.string().optional(),
    position: z.string().optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>['body'];
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>['body'];
export type EmployeeListQuery = z.infer<typeof employeeListSchema>['query'];
