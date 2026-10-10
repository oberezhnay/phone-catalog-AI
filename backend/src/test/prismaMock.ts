import { PrismaClient } from '@prisma/client';
import { beforeEach, vi } from 'vitest';
import { DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended';

vi.mock('../lib/prisma.js', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

import { prisma } from '../lib/prisma.js';

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
