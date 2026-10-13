import { describe, expect, it } from 'vitest';
import { isProductCategory, PRODUCT_CATEGORIES } from './ProductCategory';

describe('isProductCategory', () => {
  it('accepts every listed category', () => {
    for (const category of PRODUCT_CATEGORIES) {
      expect(isProductCategory(category)).toBe(true);
    }
  });

  it('rejects anything else', () => {
    expect(isProductCategory('cars')).toBe(false);
    expect(isProductCategory('Phones')).toBe(false);
    expect(isProductCategory(undefined)).toBe(false);
    expect(isProductCategory(42)).toBe(false);
  });
});
