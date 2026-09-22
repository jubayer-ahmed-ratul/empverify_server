import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { errorResponse } from '../utils/response';

export const validate = (schema: AnyZodObject) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        errorResponse(res, 'Validation failed', 422, errors);
        return;
      }
      errorResponse(res, 'Validation error', 400);
    }
  };
};
