import { Router } from 'express';
import {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
} from './products.controller.js';
import { validate } from '../../middleware/validate.js';
import { createProductSchema, updateProductSchema } from './products.schema.js';
import { auth, requireAuth } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/requireRole.js';

export const productsRouter = Router();

// Public routes
productsRouter.get('/api/products', getProducts);
productsRouter.get('/api/products/:category/:itemId', getProductDetail);

// Admin routes
productsRouter.post(
  '/api/products',
  auth,
  requireAuth,
  requireAdmin,
  validate(createProductSchema),
  createProduct,
);
productsRouter.put(
  '/api/products/:id',
  auth,
  requireAuth,
  requireAdmin,
  validate(updateProductSchema),
  updateProduct,
);
productsRouter.delete('/api/products/:id', auth, requireAuth, requireAdmin, deleteProduct);
