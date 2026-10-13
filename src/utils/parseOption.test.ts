import { describe, expect, it } from 'vitest';
import { parseOption } from './parseOption';

const SORTS = ['title', 'price', 'age'] as const;

describe('parseOption', () => {
  it('returns the value when it is one of the options', () => {
    expect(parseOption(SORTS, 'price')).toBe('price');
  });

  it('returns undefined for unknown, empty or missing values', () => {
    expect(parseOption(SORTS, 'bogus')).toBeUndefined();
    expect(parseOption(SORTS, '')).toBeUndefined();
    expect(parseOption(SORTS, null)).toBeUndefined();
  });
});
