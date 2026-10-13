import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Every protected route uses this alone: it either sets req.user or fails.
export function auth(req: Request, _res: Response, next: NextFunction): void {
  const [scheme, token] = req.headers.authorization?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    next(ApiError.unauthorized('No token provided'));
    return;
  }

  try {
    req.user = verifyToken(token);
  } catch {
    next(ApiError.unauthorized('Invalid token'));
    return;
  }

  next();
}
