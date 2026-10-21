import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  createOrderService,
  getAdminOrdersService,
  getOrdersService,
  getOrderService,
  updateOrderStatusService,
} from './orders.service.js';
import { AdminOrdersQuery, UpdateOrderStatusInput } from './orders.schema.js';

export const createOrder = asyncHandler(async (req, res) => {
  res.status(201).json(await createOrderService(req.user!.id));
});

export const getOrders = asyncHandler(async (req, res) => {
  res.json(await getOrdersService(req.user!.id));
});

export const getOrder = asyncHandler<{ id: string }, unknown, unknown, unknown>(
  async (req, res) => {
    res.json(
      await getOrderService(
        req.user!.id,
        Number(req.params.id),
        req.user!.role === 'admin',
      ),
    );
  },
);

export const getAdminOrders = asyncHandler(async (req, res) => {
  // Validated by adminOrdersQuerySchema (validate(..., 'query') in the routes)
  const { status } = req.query as unknown as AdminOrdersQuery;

  res.json(await getAdminOrdersService(status));
});

export const updateOrderStatus = asyncHandler<
  { id: string },
  unknown,
  UpdateOrderStatusInput,
  unknown
>(async (req, res) => {
  res.json(
    await updateOrderStatusService(Number(req.params.id), req.body.status),
  );
});
