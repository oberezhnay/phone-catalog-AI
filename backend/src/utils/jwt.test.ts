import { describe, expect, it } from 'vitest';
import { signToken, verifyToken, JwtPayload } from './jwt.js';

describe('jwt', () => {
  const payload: JwtPayload = {
    id: 1,
    email: 'user@example.com',
    role: 'user',
  };

  it('signs a token and verifies it back to the original payload', () => {
    const token = signToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('produces a different token for different payloads', () => {
    const tokenA = signToken(payload);
    const tokenB = signToken({ ...payload, id: 2 });

    expect(tokenA).not.toBe(tokenB);
  });

  it('throws when verifying a malformed token', () => {
    expect(() => verifyToken('not-a-real-token')).toThrow();
  });

  it('throws when verifying a tampered token', () => {
    const token = signToken(payload);
    const tampered = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`;

    expect(() => verifyToken(tampered)).toThrow();
  });
});
