import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { validate } from './validate.js';

const schema = z.object({
  qty: z.coerce.number().int().min(1),
});

describe('validate', () => {
  it('replaces req.body with the parsed output (coercions and defaults applied)', () => {
    const req = { body: { qty: '3' } } as { body: unknown };
    const next = vi.fn();

    validate(schema)(req as never, {} as never, next);

    expect(req.body).toEqual({ qty: 3 });
    expect(next).toHaveBeenCalledWith();
  });

  it('forwards a 400 ApiError carrying the first zod message', () => {
    const req = { body: { qty: 0 } };
    const next = vi.fn();

    validate(schema)(req as never, {} as never, next);

    const [error] = next.mock.calls[0];
    expect(error).toMatchObject({ statusCode: 400 });
    expect(error.message).toMatch(/at least|greater|>=|1/i);
  });

  it('validates query and replaces req.query', () => {
    const req = { query: { qty: '5' } } as { query: unknown };
    const next = vi.fn();

    validate(schema, 'query')(req as never, {} as never, next);

    expect(req.query).toEqual({ qty: 5 });
  });

  it('validates params without replacing them (handlers convert the strings)', () => {
    const req = { params: { qty: '5' } } as { params: unknown };
    const next = vi.fn();

    validate(schema, 'params')(req as never, {} as never, next);

    expect(req.params).toEqual({ qty: '5' });
    expect(next).toHaveBeenCalledWith();
  });
});
