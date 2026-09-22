import { z } from 'zod';

export const upsertReviewSchema = z.object({
  productId: z.number().int(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type UpsertReviewInput = z.infer<typeof upsertReviewSchema>;
