import { asyncHandler, NoParams } from '../../utils/asyncHandler.js';
import {
  getFavoritesService,
  addFavoriteService,
  removeFavoriteService,
} from './favorites.service.js';
import { AddFavoriteInput } from './favorites.schema.js';

export const getFavorites = asyncHandler(async (req, res) => {
  res.json(await getFavoritesService(req.user!.id));
});

export const addFavorite = asyncHandler<
  NoParams,
  unknown,
  AddFavoriteInput,
  unknown
>(async (req, res) => {
  const favorites = await addFavoriteService(req.user!.id, req.body.productId);
  res.status(201).json(favorites);
});

export const removeFavorite = asyncHandler<
  { productId: string },
  unknown,
  unknown,
  unknown
>(async (req, res) => {
  res.json(
    await removeFavoriteService(req.user!.id, Number(req.params.productId)),
  );
});
