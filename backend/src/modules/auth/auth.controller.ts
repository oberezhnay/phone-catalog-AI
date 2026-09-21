import { Request, Response, NextFunction } from 'express';
import { registerService, loginService, getMeService } from './auth.service.js';
import { ApiError } from '../../utils/ApiError.js';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await registerService(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await loginService(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const user = await getMeService(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}
