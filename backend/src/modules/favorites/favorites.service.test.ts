import { describe, expect, it } from 'vitest';
import { prismaMock } from '../../test/prismaMock.js';
import {
  addFavoriteService,
  getFavoritesService,
  removeFavoriteService,
} from './favorites.service.js';

const favorite = (productId: number) => ({
  id: productId,
  userId: 1,
  productId,
  createdAt: new Date(),
});

describe('favorites.service', () => {
  describe('getFavoritesService', () => {
    it('returns an empty array when the user has no favorites', async () => {
      prismaMock.favorite.findMany.mockResolvedValue([]);

      await expect(getFavoritesService(1)).resolves.toEqual([]);
    });

    it('maps favorites to a flat list of product ids', async () => {
      prismaMock.favorite.findMany.mockResolvedValue([favorite(5), favorite(7)]);

      await expect(getFavoritesService(1)).resolves.toEqual([5, 7]);
    });
  });

  describe('addFavoriteService', () => {
    it('upserts the favorite (idempotent) and returns the refreshed list', async () => {
      prismaMock.favorite.upsert.mockResolvedValue(favorite(5));
      prismaMock.favorite.findMany.mockResolvedValue([favorite(5)]);

      const result = await addFavoriteService(1, 5);

      expect(prismaMock.favorite.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_productId: { userId: 1, productId: 5 } },
          create: { userId: 1, productId: 5 },
        }),
      );
      expect(result).toEqual([5]);
    });
  });

  describe('removeFavoriteService', () => {
    it('deletes the matching favorite and returns the refreshed list', async () => {
      prismaMock.favorite.findMany.mockResolvedValue([]);

      const result = await removeFavoriteService(1, 5);

      expect(prismaMock.favorite.deleteMany).toHaveBeenCalledWith({
        where: { userId: 1, productId: 5 },
      });
      expect(result).toEqual([]);
    });
  });
});
