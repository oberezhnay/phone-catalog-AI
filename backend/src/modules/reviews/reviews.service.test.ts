import { describe, expect, it } from 'vitest';
import { prismaMock } from '../../test/prismaMock.js';
import {
  deleteReviewService,
  getProductReviewsService,
  upsertReviewService,
} from './reviews.service.js';

const review = (overrides: Partial<{ id: number; userId: number; rating: number }> = {}) => ({
  id: 1,
  productId: 1,
  userId: 1,
  rating: 4,
  comment: 'Good phone',
  createdAt: new Date(),
  user: { id: 1, name: 'Jane' },
  ...overrides,
});

describe('reviews.service', () => {
  describe('getProductReviewsService', () => {
    it('returns average 0 and count 0 when there are no reviews', async () => {
      prismaMock.review.findMany.mockResolvedValue([]);

      await expect(getProductReviewsService(1)).resolves.toEqual({
        reviews: [],
        average: 0,
        count: 0,
      });
    });

    it('computes the average rating across all reviews', async () => {
      prismaMock.review.findMany.mockResolvedValue([
        review({ id: 1, rating: 5 }),
        review({ id: 2, rating: 3 }),
      ] as never);

      const result = await getProductReviewsService(1);

      expect(result.count).toBe(2);
      expect(result.average).toBe(4); // (5 + 3) / 2
      expect(result.reviews).toHaveLength(2);
    });
  });

  describe('upsertReviewService', () => {
    it('throws notFound when the product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      await expect(upsertReviewService(1, 1, 5, 'great')).rejects.toMatchObject({
        statusCode: 404,
      });
      expect(prismaMock.review.upsert).not.toHaveBeenCalled();
    });

    it('upserts on the (productId, userId) unique pair so a second review updates, not duplicates', async () => {
      prismaMock.product.findUnique.mockResolvedValue({ id: 1 } as never);
      prismaMock.review.upsert.mockResolvedValue(review({ rating: 2 }) as never);

      await upsertReviewService(1, 1, 2, 'actually just okay');

      expect(prismaMock.review.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { productId_userId: { productId: 1, userId: 1 } },
          update: { rating: 2, comment: 'actually just okay' },
          create: { productId: 1, userId: 1, rating: 2, comment: 'actually just okay' },
        }),
      );
    });
  });

  describe('deleteReviewService', () => {
    it('throws notFound when the review does not exist', async () => {
      prismaMock.review.findUnique.mockResolvedValue(null);

      await expect(deleteReviewService(1, 99)).rejects.toMatchObject({ statusCode: 404 });
      expect(prismaMock.review.delete).not.toHaveBeenCalled();
    });

    it("throws notFound when the review belongs to someone else (never leaks 403 ownership info)", async () => {
      prismaMock.review.findUnique.mockResolvedValue(review({ userId: 2 }) as never);

      await expect(deleteReviewService(1, 1)).rejects.toMatchObject({ statusCode: 404 });
      expect(prismaMock.review.delete).not.toHaveBeenCalled();
    });

    it('deletes the review when it belongs to the requesting user', async () => {
      prismaMock.review.findUnique.mockResolvedValue(review({ userId: 1 }) as never);

      await deleteReviewService(1, 1);

      expect(prismaMock.review.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
