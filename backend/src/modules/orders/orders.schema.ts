import { z } from 'zod';

const orderStatus = z.enum([
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
]);

export const adminOrdersQuerySchema = z.object({
  status: orderStatus.optional(),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatus,
});

export type AdminOrdersQuery = z.infer<typeof adminOrdersQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
