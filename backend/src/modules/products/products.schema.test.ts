import { describe, expect, it } from 'vitest';
import {
  getProductsQuerySchema,
  productDetailParamsSchema,
} from './products.schema.js';

describe('getProductsQuerySchema', () => {
  it('keeps valid values', () => {
    expect(
      getProductsQuerySchema.parse({
        category: 'phones',
        sort: 'price',
        page: '2',
        perPage: '8',
      }),
    ).toEqual({ category: 'phones', sort: 'price', page: 2, perPage: 8 });
  });

  it('accepts any whole number of items per page from 1 to 100', () => {
    expect(getProductsQuerySchema.parse({ perPage: '5' }).perPage).toBe(5);
    expect(getProductsQuerySchema.parse({ perPage: '100' }).perPage).toBe(100);
    expect(getProductsQuerySchema.parse({ perPage: 1 }).perPage).toBe(1);
  });

  it('falls back to "all" for perPage outside 1–100 or not a number', () => {
    for (const perPage of ['0', '101', '-3', '2.5', 'abc', '']) {
      expect(getProductsQuerySchema.parse({ perPage }).perPage).toBe('all');
    }
  });

  it('falls back to defaults for bad values instead of rejecting the request', () => {
    expect(
      getProductsQuerySchema.parse({
        category: 'cars',
        sort: 'bogus',
        page: '0',
        perPage: 'x',
      }),
    ).toEqual({
      category: undefined,
      sort: undefined,
      page: 1,
      perPage: 'all',
    });
  });

  it('defaults perPage to "all" and page to 1 when absent', () => {
    expect(getProductsQuerySchema.parse({})).toEqual({
      page: 1,
      perPage: 'all',
    });
  });
});

describe('productDetailParamsSchema', () => {
  it('accepts a known category and an itemId', () => {
    expect(
      productDetailParamsSchema.parse({
        category: 'tablets',
        itemId: 'ipad-1',
      }),
    ).toEqual({ category: 'tablets', itemId: 'ipad-1' });
  });

  it('rejects an unknown category (previously reached Prisma and returned 500)', () => {
    expect(() =>
      productDetailParamsSchema.parse({ category: 'cars', itemId: 'x' }),
    ).toThrow();
  });
});
