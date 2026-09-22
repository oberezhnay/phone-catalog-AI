import { Router } from 'express';
import { createOrder, getOrders, getOrder } from './orders.controller.js';
import { auth, requireAuth } from '../../middleware/auth.js';

export const ordersRouter = Router();

ordersRouter.post('/api/orders', auth, requireAuth, createOrder);
ordersRouter.get('/api/orders', auth, requireAuth, getOrders);
ordersRouter.get('/api/orders/:id', auth, requireAuth, getOrder);
