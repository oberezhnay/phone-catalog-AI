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
import { productIdParamsSchema } from '../../utils/schemas.js';
import { auth } from '../../middleware/auth.js';

export const cartRouter = Router();

cartRouter.get('/api/cart', auth, getCart);
cartRouter.post('/api/cart', auth, validate(addCartItemSchema), addCartItem);
cartRouter.patch(
  '/api/cart/:productId',
  auth,
  validate(productIdParamsSchema, 'params'),
  validate(updateCartItemSchema),
  updateCartItem,
);
cartRouter.delete(
  '/api/cart/:productId',
  auth,
  validate(productIdParamsSchema, 'params'),
  removeCartItem,
);
cartRouter.delete('/api/cart', auth, clearCart);
