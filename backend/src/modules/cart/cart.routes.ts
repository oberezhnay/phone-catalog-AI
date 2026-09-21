import { Router } from 'express';
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from './cart.controller.js';
import { validate } from '../../middleware/validate.js';
import { addCartItemSchema, updateCartItemSchema } from './cart.schema.js';
import { auth, requireAuth } from '../../middleware/auth.js';

export const cartRouter = Router();

cartRouter.get('/api/cart', auth, requireAuth, getCart);
cartRouter.post(
  '/api/cart',
  auth,
  requireAuth,
  validate(addCartItemSchema),
  addCartItem,
);
cartRouter.patch(
  '/api/cart/:productId',
  auth,
  requireAuth,
  validate(updateCartItemSchema),
  updateCartItem,
);
cartRouter.delete('/api/cart/:productId', auth, requireAuth, removeCartItem);
cartRouter.delete('/api/cart', auth, requireAuth, clearCart);
