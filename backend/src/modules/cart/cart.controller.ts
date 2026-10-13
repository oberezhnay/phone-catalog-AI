import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  getCartService,
  addCartItemService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
} from './cart.service.js';
import { AddCartItemInput, UpdateCartItemInput } from './cart.schema.js';

export const getCart = asyncHandler(async (req, res) => {
  res.json(await getCartService(req.user!.id));
});

export const addCartItem = asyncHandler<{}, unknown, AddCartItemInput, unknown>(
  async (req, res) => {
    const cart = await addCartItemService(req.user!.id, req.body.productId);
    res.status(201).json(cart);
  },
);

export const updateCartItem = asyncHandler<{ productId: string }, unknown, UpdateCartItemInput, unknown>(
  async (req, res) => {
    const cart = await updateCartItemService(
      req.user!.id,
      Number(req.params.productId),
      req.body.qty,
    );

    res.json(cart);
  },
);

export const removeCartItem = asyncHandler<{ productId: string }, unknown, unknown, unknown>(
  async (req, res) => {
    res.json(await removeCartItemService(req.user!.id, Number(req.params.productId)));
  },
);

export const clearCart = asyncHandler(async (req, res) => {
  res.json(await clearCartService(req.user!.id));
});
