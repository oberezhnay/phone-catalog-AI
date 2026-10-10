import { beforeEach, describe, expect, it } from 'vitest';
import { prismaMock } from '../../test/prismaMock.js';
import {
  createOrderService,
  getOrderService,
  getOrdersService,
} from './orders.service.js';

const product = (overrides: Partial<{ id: number; priceDiscount: number }> = {}) => ({
  id: 1,
  itemId: 'phone-1',
  namespaceId: 'phone',
  category: 'phones',
  name: 'Phone 1',
  capacity: '128GB',
  capacityAvailable: ['128GB'],
  color: 'black',
  colorsAvailable: ['black'],
  priceRegular: 500,
  priceDiscount: 400,
  screen: '6"',
  resolution: null,
  processor: null,
  ram: '4GB',
  camera: null,
  zoom: null,
  cell: [],
  year: 2024,
  image: '/img.webp',
  images: [],
  description: [],
  stock: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('orders.service', () => {
  beforeEach(() => {
    // createOrderService runs its writes inside $transaction(tx => ...);
    // re-using prismaMock as `tx` lets the same mocked methods be asserted on.
    prismaMock.$transaction.mockImplementation((callback: unknown) =>
      (callback as (tx: typeof prismaMock) => unknown)(prismaMock),
    );
  });

  describe('createOrderService', () => {
    it('rejects when the cart does not exist', async () => {
      prismaMock.cart.findUnique.mockResolvedValue(null);

      await expect(createOrderService(1)).rejects.toMatchObject({ statusCode: 400 });
    });

    it('rejects when the cart is empty', async () => {
      prismaMock.cart.findUnique.mockResolvedValue({
        id: 10,
        userId: 1,
        updatedAt: new Date(),
        items: [],
      } as never);

      await expect(createOrderService(1)).rejects.toMatchObject({ statusCode: 400 });
    });

    it('computes the total from priceDiscount * quantity and snapshots it on each line', async () => {
      prismaMock.cart.findUnique.mockResolvedValue({
        id: 10,
        userId: 1,
        updatedAt: new Date(),
        items: [
          { id: 1, cartId: 10, productId: 1, quantity: 2, product: product({ priceDiscount: 400 }) },
          { id: 2, cartId: 10, productId: 2, quantity: 1, product: product({ id: 2, priceDiscount: 100 }) },
        ],
      } as never);

      prismaMock.order.create.mockResolvedValue({
        id: 99,
        userId: 1,
        status: 'pending',
        total: 900,
        createdAt: new Date(),
        items: [
          { id: 1, orderId: 99, productId: 1, quantity: 2, priceAtPurchase: 400, product: product({ priceDiscount: 400 }) },
          { id: 2, orderId: 99, productId: 2, quantity: 1, priceAtPurchase: 100, product: product({ id: 2, priceDiscount: 100 }) },
        ],
      } as never);

      const result = await createOrderService(1);

      expect(prismaMock.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 1,
            total: 900, // 2*400 + 1*100
          }),
        }),
      );
      expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 10 },
      });
      expect(result.total).toBe(900);
      expect(result.items).toHaveLength(2);
    });
  });

  describe('getOrdersService', () => {
    it('returns the serialized order list for the user, newest first per the query', async () => {
      prismaMock.order.findMany.mockResolvedValue([
        {
          id: 1,
          userId: 1,
          status: 'pending',
          total: 400,
          createdAt: new Date(),
          items: [
            { id: 1, orderId: 1, productId: 1, quantity: 1, priceAtPurchase: 400, product: product() },
          ],
        },
      ] as never);

      const result = await getOrdersService(1);

      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1 },
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result).toHaveLength(1);
      expect(result[0].total).toBe(400);
    });
  });

  describe('getOrderService', () => {
    it('throws notFound when the order does not belong to the user (or does not exist)', async () => {
      prismaMock.order.findFirst.mockResolvedValue(null);

      await expect(getOrderService(1, 42)).rejects.toMatchObject({ statusCode: 404 });
    });

    it('returns the serialized order when it belongs to the user', async () => {
      prismaMock.order.findFirst.mockResolvedValue({
        id: 42,
        userId: 1,
        status: 'pending',
        total: 400,
        createdAt: new Date(),
        items: [
          { id: 1, orderId: 42, productId: 1, quantity: 1, priceAtPurchase: 400, product: product() },
        ],
      } as never);

      const result = await getOrderService(1, 42);

      expect(prismaMock.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 42, userId: 1 } }),
      );
      expect(result.id).toBe(42);
    });
  });
});
