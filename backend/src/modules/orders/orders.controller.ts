import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createOrderService,
  getOrdersService,
  getOrderService,
} from './orders.service.js';

export const createOrder = asyncHandler(async (req, res) => {
  res.status(201).json(await createOrderService(req.user!.id));
});

export const getOrders = asyncHandler(async (req, res) => {
  res.json(await getOrdersService(req.user!.id));
});

export const getOrder = asyncHandler<{ id: string }, unknown, unknown, unknown>(
  async (req, res) => {
    res.json(await getOrderService(req.user!.id, Number(req.params.id)));
  },
);
