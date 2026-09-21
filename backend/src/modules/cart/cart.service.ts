import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

async function getOrCreateCart(userId: number) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getCartService(userId: number) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!cart) {
    return [];
  }

  return cart.items.map(item => ({ id: item.productId, qty: item.quantity }));
}

export async function addCartItemService(userId: number, productId: number) {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: {},
    create: { cartId: cart.id, productId, quantity: 1 },
  });

  return getCartService(userId);
}

export async function updateCartItemService(
  userId: number,
  productId: number,
  qty: number,
) {
  const cart = await getOrCreateCart(userId);

  const item = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (!item) {
    throw ApiError.notFound('Cart item not found');
  }

  await prisma.cartItem.update({
    where: { cartId_productId: { cartId: cart.id, productId } },
    data: { quantity: qty },
  });

  return getCartService(userId);
}

export async function removeCartItemService(userId: number, productId: number) {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  });

  return getCartService(userId);
}

export async function clearCartService(userId: number) {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return [];
}
