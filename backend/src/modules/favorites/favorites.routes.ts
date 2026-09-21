import { Router } from 'express';
import { getFavorites, addFavorite, removeFavorite } from './favorites.controller.js';
import { validate } from '../../middleware/validate.js';
import { addFavoriteSchema } from './favorites.schema.js';
import { auth, requireAuth } from '../../middleware/auth.js';

export const favoritesRouter = Router();

favoritesRouter.get('/api/favorites', auth, requireAuth, getFavorites);
favoritesRouter.post(
  '/api/favorites',
  auth,
  requireAuth,
  validate(addFavoriteSchema),
  addFavorite,
);
favoritesRouter.delete('/api/favorites/:productId', auth, requireAuth, removeFavorite);
