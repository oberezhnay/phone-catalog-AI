import { Router } from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from './favorites.controller.js';
import { validate } from '../../middleware/validate.js';
import { addFavoriteSchema } from './favorites.schema.js';
import { productIdParamsSchema } from '../../utils/schemas.js';
import { auth } from '../../middleware/auth.js';

export const favoritesRouter = Router();

favoritesRouter.get('/api/favorites', auth, getFavorites);
favoritesRouter.post(
  '/api/favorites',
  auth,
  validate(addFavoriteSchema),
  addFavorite,
);
favoritesRouter.delete(
  '/api/favorites/:productId',
  auth,
  validate(productIdParamsSchema, 'params'),
  removeFavorite,
);
