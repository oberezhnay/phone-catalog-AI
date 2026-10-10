import { describe, expect, it } from 'vitest';
import { getTotalCartItems } from './cart';
import { CartItem } from '../contexts/CartContext';

describe('getTotalCartItems', () => {
  it('returns 0 for an empty cart', () => {
    expect(getTotalCartItems([])).toBe(0);
  });

  it('returns the quantity for a single item', () => {
    const cart: CartItem[] = [{ id: 1, qty: 3 }];

    expect(getTotalCartItems(cart)).toBe(3);
  });

  it('sums quantities across multiple items', () => {
    const cart: CartItem[] = [
      { id: 1, qty: 2 },
      { id: 2, qty: 1 },
      { id: 3, qty: 5 },
    ];

    expect(getTotalCartItems(cart)).toBe(8);
  });
});
