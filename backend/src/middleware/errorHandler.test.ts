import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { errorHandler, notFoundHandler } from './errorHandler.js';
import { ApiError } from '../utils/ApiError.js';

function mockResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

const run = (err: unknown) => {
  const res = mockResponse();
  errorHandler(err, {} as never, res as never, vi.fn());
  return res;
};

describe('errorHandler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('answers an ApiError with its status and message without logging it', () => {
    const res = run(ApiError.forbidden('nope'));

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'nope', code: undefined });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('maps Prisma P2002 to 409 DUPLICATE', () => {
    const res = run({ code: 'P2002' });

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'DUPLICATE' }));
  });

  it('maps Prisma P2003 (missing referenced row) to 404', () => {
    const res = run({ code: 'P2003' });

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('maps Prisma P2025 to 404', () => {
    const res = run({ code: 'P2025' });

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('answers malformed JSON bodies with 400', () => {
    const syntaxError = Object.assign(new SyntaxError('Unexpected token'), { status: 400 });
    const res = run(syntaxError);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid JSON body' });
  });

  it('hides unknown errors behind a generic 500 and logs them', () => {
    const res = run(new Error('secret db detail'));

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    expect(console.error).toHaveBeenCalled();
  });
});

describe('notFoundHandler', () => {
  it('forwards a 404 ApiError for unknown routes', () => {
    const next = vi.fn();

    notFoundHandler({} as never, {} as never, next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 404 });
  });
});
