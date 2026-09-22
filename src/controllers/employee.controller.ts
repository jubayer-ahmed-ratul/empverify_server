import { Response, NextFunction } from 'express';
import { employeeService } from '../services/employee.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeListQuery,
} from '../validators/employee.validator';

export class EmployeeController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin) {
        errorResponse(res, 'Unauthorized', 401);
        return;
      }

      const input = req.body as CreateEmployeeInput;
      const photo = req.file;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await employeeService.createEmployee(
        input,
        photo,
        req.admin.id,
        ipAddress,
        userAgent
      );

      successResponse(res, result, 'Employee created successfully', 201);
    } catch (error) {
      if (error instanceof Error && error.message === 'Employee ID already exists') {
        errorResponse(res, error.message, 409);
        return;
      }
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as EmployeeListQuery;

      const result = await employeeService.getEmployees(query);

      successResponse(
        res,
        result.employees,
        'Employees retrieved successfully',
        200,
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const employee = await employeeService.getEmployeeById(id);

      successResponse(res, employee, 'Employee retrieved successfully', 200);
    } catch (error) {
      if (error instanceof Error && error.message === 'Employee not found') {
        errorResponse(res, error.message, 404);
        return;
      }
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin) {
        errorResponse(res, 'Unauthorized', 401);
        return;
      }

      const { id } = req.params;
      const input = req.body as UpdateEmployeeInput;
      const photo = req.file;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const employee = await employeeService.updateEmployee(
        id,
        input,
        photo,
        req.admin.id,
        ipAddress,
        userAgent
      );

      successResponse(res, employee, 'Employee updated successfully', 200);
    } catch (error) {
      if (error instanceof Error && error.message === 'Employee not found') {
        errorResponse(res, error.message, 404);
        return;
      }
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin) {
        errorResponse(res, 'Unauthorized', 401);
        return;
      }

      const { id } = req.params;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      await employeeService.deleteEmployee(id, req.admin.id, ipAddress, userAgent);

      successResponse(res, null, 'Employee deleted successfully', 200);
    } catch (error) {
      if (error instanceof Error && error.message === 'Employee not found') {
        errorResponse(res, error.message, 404);
        return;
      }
      next(error);
    }
  }

  async regenerateQR(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin) {
        errorResponse(res, 'Unauthorized', 401);
        return;
      }

      const { id } = req.params;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await employeeService.regenerateQR(
        id,
        req.admin.id,
        ipAddress,
        userAgent
      );

      successResponse(res, result, 'QR code regenerated successfully', 200);
    } catch (error) {
      if (error instanceof Error && error.message === 'Employee not found') {
        errorResponse(res, error.message, 404);
        return;
      }
      next(error);
    }
  }

  async getIdCard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const idCard = await employeeService.getIdCard(id);

      successResponse(res, idCard, 'ID card data retrieved successfully', 200);
    } catch (error) {
      if (error instanceof Error && error.message === 'Employee not found') {
        errorResponse(res, error.message, 404);
        return;
      }
      next(error);
    }
  }
}

export const employeeController = new EmployeeController();
