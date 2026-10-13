import { describe, expect, it, vi } from 'vitest';
import { asyncHandler } from './asyncHandler.js';

const flush = () => new Promise(resolve => setImmediate(resolve));

describe('asyncHandler', () => {
  it('forwards a rejected promise to next() instead of leaving it unhandled', async () => {
    const failure = new Error('boom');
    const handler = asyncHandler(async () => {
      throw failure;
    });
    const next = vi.fn();

    handler({} as never, {} as never, next);
    await flush();

    expect(next).toHaveBeenCalledWith(failure);
  });

  it('does not call next() when the handler succeeds', async () => {
    const handler = asyncHandler(async (_req, res) => {
      res.json({ ok: true });
    });
    const next = vi.fn();
    const res = { json: vi.fn() };

    handler({} as never, res as never, next);
    await flush();

    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(next).not.toHaveBeenCalled();
  });
});
