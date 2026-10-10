import { describe, expect, it } from 'vitest';
import { comparePassword, hashPassword } from './password.js';

describe('password', () => {
  it('hashes a password to a different string than the original', async () => {
    const hash = await hashPassword('super-secret');

    expect(hash).not.toBe('super-secret');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('produces a different hash each time (bcrypt salting)', async () => {
    const hashA = await hashPassword('super-secret');
    const hashB = await hashPassword('super-secret');

    expect(hashA).not.toBe(hashB);
  });

  it('matches the correct password against its hash', async () => {
    const hash = await hashPassword('super-secret');

    await expect(comparePassword('super-secret', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password against the hash', async () => {
    const hash = await hashPassword('super-secret');

    await expect(comparePassword('wrong-password', hash)).resolves.toBe(false);
  });
});
