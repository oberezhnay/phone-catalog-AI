import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1),
  itemId: z.string().min(1),
  namespaceId: z.string().min(1),
  category: z.enum(['phones', 'tablets', 'accessories']),
  capacity: z.string().min(1),
  capacityAvailable: z.array(z.string()),
  color: z.string().min(1),
  colorsAvailable: z.array(z.string()),
  priceRegular: z.number().int().positive(),
  priceDiscount: z.number().int().positive(),
  screen: z.string().min(1),
  resolution: z.string().optional(),
  processor: z.string().optional(),
  ram: z.string().min(1),
  camera: z.string().optional(),
  zoom: z.string().optional(),
  cell: z.array(z.string()).default([]),
  year: z.number().int(),
  image: z.string().min(1),
  images: z.array(z.string()),
  description: z.array(
    z.object({
      title: z.string(),
      text: z.array(z.string()),
    }),
  ),
  stock: z.number().int().default(20),
});

export const updateProductSchema = createProductSchema.partial();

export const getProductsQuerySchema = z.object({
  category: z.enum(['phones', 'tablets', 'accessories']).optional(),
  sort: z.enum(['title', 'price', 'age']).optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.enum(['4', '8', '16', 'all']).default('all'),
  search: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;
