import { prisma } from '../../lib/prisma.js';

export async function getFavoritesService(userId: number) {
  const favorites = await prisma.favorite.findMany({ where: { userId } });

  return favorites.map(favorite => favorite.productId);
}

export async function addFavoriteService(userId: number, productId: number) {
  await prisma.favorite.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  });

  return getFavoritesService(userId);
}

export async function removeFavoriteService(userId: number, productId: number) {
  await prisma.favorite.deleteMany({ where: { userId, productId } });

  return getFavoritesService(userId);
}
