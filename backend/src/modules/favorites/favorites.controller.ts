import { Request, Response, NextFunction } from 'express';
import {
  getFavoritesService,
  addFavoriteService,
  removeFavoriteService,
} from './favorites.service.js';

export async function getFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const favorites = await getFavoritesService(req.user!.id);
    res.json(favorites);
  } catch (error) {
    next(error);
  }
}

export async function addFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { productId } = req.body;
    const favorites = await addFavoriteService(req.user!.id, productId);
    res.status(201).json(favorites);
  } catch (error) {
    next(error);
  }
}

export async function removeFavorite(
  req: Request<{ productId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const favorites = await removeFavoriteService(
      req.user!.id,
      parseInt(req.params.productId),
    );

    res.json(favorites);
  } catch (error) {
    next(error);
  }
}
