import { Router } from 'express';
import { createOrder, getOrders, getOrder } from './orders.controller.js';
import { validate } from '../../middleware/validate.js';
import { idParamsSchema } from '../../utils/schemas.js';
import { auth } from '../../middleware/auth.js';

export const ordersRouter = Router();

ordersRouter.post('/api/orders', auth, createOrder);
ordersRouter.get('/api/orders', auth, getOrders);
ordersRouter.get('/api/orders/:id', auth, validate(idParamsSchema, 'params'), getOrder);
