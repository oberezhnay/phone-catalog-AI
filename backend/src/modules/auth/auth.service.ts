import { prisma } from '../../lib/prisma.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';
import { ApiError } from '../../utils/ApiError.js';
import { RegisterInput, LoginInput } from './auth.schema.js';

function toPublicUser(user: { id: number; email: string; name: string; role: string }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function registerService(data: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });

  if (existing) {
    throw ApiError.conflict('User with this email already exists');
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
    },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return { user: toPublicUser(user), token };
}

export async function loginService(data: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isValid = await comparePassword(data.password, user.passwordHash);

  if (!isValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return { user: toPublicUser(user), token };
}

export async function getMeService(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return toPublicUser(user);
}
