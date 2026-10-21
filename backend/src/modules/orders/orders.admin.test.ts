import { describe, expect, it } from 'vitest';
import { prismaMock } from '../../test/prismaMock.js';
import {
  getAdminOrdersService,
  getOrderService,
  updateOrderStatusService,
} from './orders.service.js';

const order = {
  id: 7,
  userId: 3,
  status: 'pending',
  total: 800,
  createdAt: new Date('2026-01-01'),
  items: [],
  user: { id: 3, email: 'u@test.com', name: 'U' },
};

describe('orders.service (admin)', () => {
  describe('getAdminOrdersService', () => {
    it('lists all orders newest first and includes the buyer', async () => {
      prismaMock.order.findMany.mockResolvedValue([order] as never);

      const result = await getAdminOrdersService();

      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: undefined,
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result[0]).toMatchObject({
        id: 7,
        user: { email: 'u@test.com' },
      });
    });

    it('filters by status when given', async () => {
      prismaMock.order.findMany.mockResolvedValue([] as never);

      await getAdminOrdersService('shipped');

      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'shipped' } }),
      );
    });
  });

  describe('updateOrderStatusService', () => {
    it('updates the status and returns the order', async () => {
      prismaMock.order.update.mockResolvedValue({
        ...order,
        status: 'paid',
      } as never);

      const result = await updateOrderStatusService(7, 'paid');

      expect(prismaMock.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 7 },
          data: { status: 'paid' },
        }),
      );
      expect(result.status).toBe('paid');
    });
  });

  describe('getOrderService', () => {
    it('scopes the lookup to the owner by default', async () => {
      prismaMock.order.findFirst.mockResolvedValue(order as never);

      await getOrderService(1, 7);

      expect(prismaMock.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 7, userId: 1 } }),
      );
    });

    it('lets an admin read any order', async () => {
      prismaMock.order.findFirst.mockResolvedValue(order as never);

      await getOrderService(1, 7, true);

      expect(prismaMock.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 7 } }),
      );
    });
  });
});
