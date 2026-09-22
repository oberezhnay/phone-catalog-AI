import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { Order, OrderItem, Product } from '@prisma/client';

type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
};

function serializeOrder(order: OrderWithItems) {
  return {
    id: order.id,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    items: order.items.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase,
      product: item.product,
    })),
  };
}

export async function createOrderService(userId: number) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Cart is empty');
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.product.priceDiscount * item.quantity,
    0,
  );

  const order = await prisma.$transaction(async tx => {
    const created = await tx.order.create({
      data: {
        userId,
        total,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.product.priceDiscount,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return created;
  });

  return serializeOrder(order);
}

export async function getOrdersService(userId: number) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map(serializeOrder);
}

export async function getOrderService(userId: number, orderId: number) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  return serializeOrder(order);
}
