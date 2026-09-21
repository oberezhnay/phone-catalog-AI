import { Router } from 'express';
import { register, login, me } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { auth, requireAuth } from '../../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/api/auth/register', validate(registerSchema), register);
authRouter.post('/api/auth/login', validate(loginSchema), login);
authRouter.get('/api/auth/me', auth, requireAuth, me);
