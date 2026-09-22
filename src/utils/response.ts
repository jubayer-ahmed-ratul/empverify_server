import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Operation successful',
  statusCode: number = 200,
  pagination?: PaginationMeta
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message: string = 'Something went wrong',
  statusCode: number = 500,
  errors?: any[]
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
