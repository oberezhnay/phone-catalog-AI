import { z } from 'zod';

export const addFavoriteSchema = z.object({
  productId: z.number().int(),
});

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;
