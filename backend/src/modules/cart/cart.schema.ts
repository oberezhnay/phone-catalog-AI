import { z } from 'zod';

export const addCartItemSchema = z.object({
  productId: z.number().int(),
});

export const updateCartItemSchema = z.object({
  qty: z.number().int().min(1),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
