import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    next(ApiError.unauthorized('Authentication required'));
    return;
  }
  if (req.user.role !== 'admin') {
    next(ApiError.forbidden('Admin access required'));
    return;
  }
  next();
}
