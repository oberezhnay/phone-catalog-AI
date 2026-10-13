import { describe, expect, it } from 'vitest';
import {
  getProductsQuerySchema,
  productDetailParamsSchema,
} from './products.schema.js';

describe('getProductsQuerySchema', () => {
  it('keeps valid values', () => {
    expect(
      getProductsQuerySchema.parse({ category: 'phones', sort: 'price', page: '2', perPage: '8' }),
    ).toEqual({ category: 'phones', sort: 'price', page: 2, perPage: '8' });
  });

  it('falls back to defaults for bad values instead of rejecting the request', () => {
    expect(
      getProductsQuerySchema.parse({ category: 'cars', sort: 'bogus', page: '0', perPage: '5' }),
    ).toEqual({ category: undefined, sort: undefined, page: 1, perPage: 'all' });
  });

  it('defaults perPage to "all" and page to 1 when absent', () => {
    expect(getProductsQuerySchema.parse({})).toEqual({ page: 1, perPage: 'all' });
  });
});

describe('productDetailParamsSchema', () => {
  it('accepts a known category and an itemId', () => {
    expect(
      productDetailParamsSchema.parse({ category: 'tablets', itemId: 'ipad-1' }),
    ).toEqual({ category: 'tablets', itemId: 'ipad-1' });
  });

  it('rejects an unknown category (previously reached Prisma and returned 500)', () => {
    expect(() =>
      productDetailParamsSchema.parse({ category: 'cars', itemId: 'x' }),
    ).toThrow();
  });
});
