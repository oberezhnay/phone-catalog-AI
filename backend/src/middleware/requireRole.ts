import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';

export function requireRole(role: 'user' | 'admin') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role && !(role === 'admin' && req.user.role !== 'admin')) {
      if (!req.user) {
        next(ApiError.unauthorized('Authentication required'));
        return;
      }
      next(ApiError.forbidden('Insufficient permissions'));
      return;
    }
    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
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
