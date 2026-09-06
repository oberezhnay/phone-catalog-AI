import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error(err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    res.status(409).json({
      error: 'Resource already exists',
      code: 'DUPLICATE',
    });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({
      error: 'Resource not found',
      code: 'NOT_FOUND',
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
  });
}
