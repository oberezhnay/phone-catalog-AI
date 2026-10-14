import { describe, expect, it } from 'vitest';
import { shuffle } from './shuffle';

describe('shuffle', () => {
  it('returns the same items in a new array', () => {
    const items = [1, 2, 3, 4, 5];
    const result = shuffle(items);

    expect(result).not.toBe(items);
    expect([...result].sort()).toEqual(items);
  });

  it('does not change the input', () => {
    const items = [1, 2, 3, 4];

    shuffle(items, () => 0);

    expect(items).toEqual([1, 2, 3, 4]);
  });

  it('is deterministic for a fixed random source', () => {
    expect(shuffle([1, 2, 3, 4], () => 0)).toEqual([2, 3, 4, 1]);
  });

  it('handles empty and single-item lists', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([1])).toEqual([1]);
  });
});
