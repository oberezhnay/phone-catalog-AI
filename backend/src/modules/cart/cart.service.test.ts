import { describe, expect, it } from 'vitest';
import { prismaMock } from '../../test/prismaMock.js';
import {
  addCartItemService,
  clearCartService,
  getCartService,
  removeCartItemService,
  updateCartItemService,
} from './cart.service.js';

const cart = { id: 10, userId: 1, updatedAt: new Date() };

describe('cart.service', () => {
  describe('getCartService', () => {
    it('returns an empty array when the user has no cart yet', async () => {
      prismaMock.cart.findUnique.mockResolvedValue(null);

      await expect(getCartService(1)).resolves.toEqual([]);
    });

    it('maps cart items to the {id, qty} shape expected by the frontend', async () => {
      prismaMock.cart.findUnique.mockResolvedValue({
        ...cart,
        items: [
          { id: 1, cartId: 10, productId: 5, quantity: 2 },
          { id: 2, cartId: 10, productId: 7, quantity: 1 },
        ],
      } as never);

      await expect(getCartService(1)).resolves.toEqual([
        { id: 5, qty: 2 },
        { id: 7, qty: 1 },
      ]);
    });
  });

  describe('addCartItemService', () => {
    it('creates the cart if needed, upserts the item, and returns the refreshed cart', async () => {
      prismaMock.cart.upsert.mockResolvedValue(cart);
      prismaMock.cartItem.upsert.mockResolvedValue({
        id: 1,
        cartId: 10,
        productId: 5,
        quantity: 1,
      });
      prismaMock.cart.findUnique.mockResolvedValue({
        ...cart,
        items: [{ id: 1, cartId: 10, productId: 5, quantity: 1 }],
      } as never);

      const result = await addCartItemService(1, 5);

      expect(prismaMock.cart.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 1 } }),
      );
      expect(prismaMock.cartItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { cartId_productId: { cartId: 10, productId: 5 } },
          create: { cartId: 10, productId: 5, quantity: 1 },
        }),
      );
      expect(result).toEqual([{ id: 5, qty: 1 }]);
    });
  });

  describe('updateCartItemService', () => {
    it('throws notFound when the item is not in the cart', async () => {
      prismaMock.cart.upsert.mockResolvedValue(cart);
      prismaMock.cartItem.findUnique.mockResolvedValue(null);

      await expect(updateCartItemService(1, 5, 3)).rejects.toMatchObject({
        statusCode: 404,
      });
      expect(prismaMock.cartItem.update).not.toHaveBeenCalled();
    });

    it('updates the quantity and returns the refreshed cart', async () => {
      prismaMock.cart.upsert.mockResolvedValue(cart);
      prismaMock.cartItem.findUnique.mockResolvedValue({
        id: 1,
        cartId: 10,
        productId: 5,
        quantity: 1,
      });
      prismaMock.cartItem.update.mockResolvedValue({
        id: 1,
        cartId: 10,
        productId: 5,
        quantity: 3,
      });
      prismaMock.cart.findUnique.mockResolvedValue({
        ...cart,
        items: [{ id: 1, cartId: 10, productId: 5, quantity: 3 }],
      } as never);

      const result = await updateCartItemService(1, 5, 3);

      expect(prismaMock.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { quantity: 3 } }),
      );
      expect(result).toEqual([{ id: 5, qty: 3 }]);
    });
  });

  describe('removeCartItemService', () => {
    it('deletes the matching item and returns the refreshed cart', async () => {
      prismaMock.cart.upsert.mockResolvedValue(cart);
      prismaMock.cart.findUnique.mockResolvedValue({
        ...cart,
        items: [],
      } as never);

      const result = await removeCartItemService(1, 5);

      expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 10, productId: 5 },
      });
      expect(result).toEqual([]);
    });
  });

  describe('clearCartService', () => {
    it('deletes every item in the cart and returns an empty array', async () => {
      prismaMock.cart.upsert.mockResolvedValue(cart);

      const result = await clearCartService(1);

      expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 10 },
      });
      expect(result).toEqual([]);
    });
  });
});
