import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';

function getPrismaCode(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const { code } = err;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound('Route not found'));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Malformed JSON body from express.json()
  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  console.error(err);

  switch (getPrismaCode(err)) {
    case 'P2002':
      res.status(409).json({ error: 'Resource already exists', code: 'DUPLICATE' });
      return;
    case 'P2003':
      // Foreign key failure: a referenced row (e.g. productId) does not exist
      res.status(404).json({ error: 'Related resource not found', code: 'NOT_FOUND' });
      return;
    case 'P2025':
      res.status(404).json({ error: 'Resource not found', code: 'NOT_FOUND' });
      return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
