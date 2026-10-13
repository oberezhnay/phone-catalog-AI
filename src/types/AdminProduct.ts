import { ProductRecord } from './ProductRecord';

export type { DescriptionBlock } from './ProductRecord';

export type AdminProduct = ProductRecord;

type NullableFields = 'resolution' | 'processor' | 'camera' | 'zoom';

// The write API (zod `.optional()`) accepts a missing key but not `null`,
// unlike the read shape above which comes back from Prisma as `string | null`.
export type AdminProductInput = Omit<ProductRecord, 'id' | NullableFields> & {
  [K in NullableFields]?: string;
};
