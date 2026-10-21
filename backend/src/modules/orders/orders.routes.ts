import { Router } from 'express';
import {
  createOrder,
  getAdminOrders,
  getOrder,
  getOrders,
  updateOrderStatus,
} from './orders.controller.js';
import { validate } from '../../middleware/validate.js';
import { idParamsSchema } from '../../utils/schemas.js';
import { auth } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/requireRole.js';
import {
  adminOrdersQuerySchema,
  updateOrderStatusSchema,
} from './orders.schema.js';

export const ordersRouter = Router();

ordersRouter.post('/api/orders', auth, createOrder);
ordersRouter.get('/api/orders', auth, getOrders);
ordersRouter.get(
  '/api/orders/:id',
  auth,
  validate(idParamsSchema, 'params'),
  getOrder,
);

ordersRouter.get(
  '/api/admin/orders',
  auth,
  requireAdmin,
  validate(adminOrdersQuerySchema, 'query'),
  getAdminOrders,
);
ordersRouter.patch(
  '/api/admin/orders/:id/status',
  auth,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  validate(updateOrderStatusSchema),
  updateOrderStatus,
);
