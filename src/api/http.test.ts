import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, http } from './http';

function mockResponse(overrides: {
  ok: boolean;
  status: number;
  json?: () => Promise<unknown>;
}) {
  return {
    ok: overrides.ok,
    status: overrides.status,
    json: overrides.json ?? (() => Promise.resolve({})),
  } as Response;
}

describe('http', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the given path under the configured API base URL', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ok: true }),
      }),
    );

    await http('/products');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/products',
      expect.anything(),
    );
  });

  it('always sends a JSON Content-Type header', async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({ ok: true, status: 200 }));

    await http('/products');

    const [, init] = vi.mocked(fetch).mock.calls[0];

    expect((init?.headers as Record<string, string>)['Content-Type']).toBe(
      'application/json',
    );
  });

  it('adds an Authorization header only when a token is given', async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({ ok: true, status: 200 }));

    await http('/orders', { token: 'abc123' });

    const [, init] = vi.mocked(fetch).mock.calls[0];

    expect((init?.headers as Record<string, string>).Authorization).toBe(
      'Bearer abc123',
    );
  });

  it('omits the Authorization header when no token is given', async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({ ok: true, status: 200 }));

    await http('/products');

    const [, init] = vi.mocked(fetch).mock.calls[0];

    expect(
      (init?.headers as Record<string, string>).Authorization,
    ).toBeUndefined();
  });

  it('merges caller-provided headers alongside the defaults', async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({ ok: true, status: 200 }));

    await http('/products', { headers: { 'X-Test': 'yes' } });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = init?.headers as Record<string, string>;

    expect(headers['X-Test']).toBe('yes');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('returns the parsed JSON body on success', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 1 }),
      }),
    );

    await expect(http('/products/1')).resolves.toEqual({ id: 1 });
  });

  it('returns undefined for 204 without reading the body', async () => {
    const json = vi.fn();

    vi.mocked(fetch).mockResolvedValue(
      mockResponse({ ok: true, status: 204, json }),
    );

    await expect(http('/cart/1')).resolves.toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it('throws an ApiError with the status and server message', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: 'Email already taken' }),
      }),
    );

    await expect(http('/auth/register')).rejects.toMatchObject({
      status: 409,
      message: 'Email already taken',
    });
  });

  it('throws an ApiError instance, not just a matching shape', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({ ok: false, status: 500, json: () => Promise.resolve({}) }),
    );

    await expect(http('/anything')).rejects.toBeInstanceOf(ApiError);
  });

  it('falls back to "Request failed" with no error message', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({ ok: false, status: 500, json: () => Promise.resolve({}) }),
    );

    await expect(http('/anything')).rejects.toMatchObject({
      message: 'Request failed',
    });
  });

  it('falls back to "Request failed" on a non-JSON error body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('not json')),
      }),
    );

    await expect(http('/anything')).rejects.toMatchObject({
      status: 500,
      message: 'Request failed',
    });
  });
});
