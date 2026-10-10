import { describe, expect, it } from 'vitest';
import { prismaMock } from '../../test/prismaMock.js';
import { getMeService, loginService, registerService } from './auth.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { hashPassword } from '../../utils/password.js';

const dbUser = {
  id: 1,
  email: 'user@example.com',
  name: 'Jane Doe',
  passwordHash: '',
  role: 'user' as const,
  createdAt: new Date(),
};

describe('auth.service', () => {
  describe('registerService', () => {
    it('creates a user and returns a token when the email is free', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(dbUser);

      const result = await registerService({
        email: 'user@example.com',
        password: 'password123',
        name: 'Jane Doe',
      });

      expect(result.user).toEqual({
        id: 1,
        email: 'user@example.com',
        name: 'Jane Doe',
        role: 'user',
      });
      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);
      // The public user shape must never leak the password hash.
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('rejects registration when the email is already taken', async () => {
      prismaMock.user.findUnique.mockResolvedValue(dbUser);

      await expect(
        registerService({
          email: 'user@example.com',
          password: 'password123',
          name: 'Jane Doe',
        }),
      ).rejects.toMatchObject({ statusCode: 409 });

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('loginService', () => {
    it('returns a token when credentials are correct', async () => {
      const passwordHash = await hashPassword('password123');

      prismaMock.user.findUnique.mockResolvedValue({ ...dbUser, passwordHash });

      const result = await loginService({
        email: 'user@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('user@example.com');
      expect(typeof result.token).toBe('string');
    });

    it('rejects login for an unknown email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        loginService({ email: 'nobody@example.com', password: 'password123' }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('rejects login for the wrong password', async () => {
      const passwordHash = await hashPassword('password123');

      prismaMock.user.findUnique.mockResolvedValue({ ...dbUser, passwordHash });

      await expect(
        loginService({ email: 'user@example.com', password: 'wrong-password' }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  describe('getMeService', () => {
    it('returns the public shape of the user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(dbUser);

      const result = await getMeService(1);

      expect(result).toEqual({
        id: 1,
        email: 'user@example.com',
        name: 'Jane Doe',
        role: 'user',
      });
    });

    it('throws notFound when the user no longer exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(getMeService(999)).rejects.toMatchObject({ statusCode: 404 });
    });

    it('surfaces an ApiError instance, not just a matching shape', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(getMeService(999)).rejects.toBeInstanceOf(ApiError);
    });
  });
});
