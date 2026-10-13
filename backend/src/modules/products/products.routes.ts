import { Router } from 'express';
import {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
} from './products.controller.js';
import { validate } from '../../middleware/validate.js';
import {
  createProductSchema,
  getProductsQuerySchema,
  productDetailParamsSchema,
  updateProductSchema,
} from './products.schema.js';
import { idParamsSchema } from '../../utils/schemas.js';
import { auth } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/requireRole.js';

export const productsRouter = Router();

// Public routes
productsRouter.get('/api/products', validate(getProductsQuerySchema, 'query'), getProducts);
productsRouter.get(
  '/api/products/:category/:itemId',
  validate(productDetailParamsSchema, 'params'),
  getProductDetail,
);

// Admin routes
productsRouter.post(
  '/api/products',
  auth,
  requireAdmin,
  validate(createProductSchema),
  createProduct,
);
productsRouter.put(
  '/api/products/:id',
  auth,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  validate(updateProductSchema),
  updateProduct,
);
productsRouter.delete(
  '/api/products/:id',
  auth,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  deleteProduct,
);
