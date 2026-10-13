import { z } from 'zod';

const categories = ['phones', 'tablets', 'accessories'] as const;

export const createProductSchema = z.object({
  name: z.string().min(1),
  itemId: z.string().min(1),
  namespaceId: z.string().min(1),
  category: z.enum(categories),
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

// The list page sends these from the URL, where bad values used to be ignored.
// `.catch` keeps that behaviour: an invalid value falls back to its default.
export const getProductsQuerySchema = z.object({
  category: z.enum(categories).optional().catch(undefined),
  sort: z.enum(['title', 'price', 'age']).optional().catch(undefined),
  page: z.coerce.number().int().positive().catch(1),
  // Any whole number from 1 to 100 (as before), or 'all'. Caps the page size.
  perPage: z
    .union([z.literal('all'), z.coerce.number().int().min(1).max(100)])
    .catch('all'),
  search: z.string().optional(),
});

export const productDetailParamsSchema = z.object({
  category: z.enum(categories),
  itemId: z.string().min(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;
export type ProductDetailParams = z.infer<typeof productDetailParamsSchema>;
