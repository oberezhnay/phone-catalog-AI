import { z } from 'zod';
import { positiveIntParam } from '../../utils/schemas.js';

export const upsertReviewSchema = z.object({
  productId: z.number().int(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const reviewsQuerySchema = z.object({
  productId: positiveIntParam,
});

export type UpsertReviewInput = z.infer<typeof upsertReviewSchema>;
export type ReviewsQuery = z.infer<typeof reviewsQuerySchema>;
