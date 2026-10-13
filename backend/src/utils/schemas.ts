import { z } from 'zod';

// Route params arrive as strings; coerce and require a positive integer.
export const positiveIntParam = z.coerce
  .number({ invalid_type_error: 'Invalid id' })
  .int({ message: 'Invalid id' })
  .positive({ message: 'Invalid id' });

export const idParamsSchema = z.object({ id: positiveIntParam });

export const productIdParamsSchema = z.object({ productId: positiveIntParam });
