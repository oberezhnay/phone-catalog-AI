export const PRODUCT_CATEGORIES = ['phones', 'tablets', 'accessories'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const isProductCategory = (value: unknown): value is ProductCategory =>
  PRODUCT_CATEGORIES.some(category => category === value);
