import { describe, expect, it } from 'vitest';
import { ApiError } from './ApiError.js';

describe('ApiError', () => {
  it('is an instance of Error with the given message, status and code', () => {
    const error = new ApiError(418, "I'm a teapot", 'TEAPOT');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.statusCode).toBe(418);
    expect(error.message).toBe("I'm a teapot");
    expect(error.code).toBe('TEAPOT');
  });

  it('badRequest always carries the given message', () => {
    const error = ApiError.badRequest('missing field');

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('missing field');
  });

  it('unauthorized defaults to "Unauthorized" and accepts an override', () => {
    expect(ApiError.unauthorized().message).toBe('Unauthorized');
    expect(ApiError.unauthorized().statusCode).toBe(401);
    expect(ApiError.unauthorized('bad token').message).toBe('bad token');
  });

  it('forbidden defaults to "Forbidden" and accepts an override', () => {
    expect(ApiError.forbidden().message).toBe('Forbidden');
    expect(ApiError.forbidden().statusCode).toBe(403);
    expect(ApiError.forbidden('no access').message).toBe('no access');
  });

  it('notFound defaults to "Not found" and accepts an override', () => {
    expect(ApiError.notFound().message).toBe('Not found');
    expect(ApiError.notFound().statusCode).toBe(404);
    expect(ApiError.notFound('user not found').message).toBe('user not found');
  });

  it('conflict defaults to "Conflict" and accepts an override', () => {
    expect(ApiError.conflict().message).toBe('Conflict');
    expect(ApiError.conflict().statusCode).toBe(409);
    expect(ApiError.conflict('already exists').message).toBe('already exists');
  });

  it('internal defaults to "Internal server error", accepts an override', () => {
    expect(ApiError.internal().message).toBe('Internal server error');
    expect(ApiError.internal().statusCode).toBe(500);
    expect(ApiError.internal('boom').message).toBe('boom');
  });
});
