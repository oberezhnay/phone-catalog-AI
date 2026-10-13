import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { Order, OrderItem, Product } from '@prisma/client';

type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
};

const orderInclude = { items: { include: { product: true } } } as const;

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
  // Read the cart inside the transaction so the order and the cart clear
  // are based on the same state.
  return prisma.$transaction(async tx => {
    const cart = await tx.cart.findUnique({
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
      include: orderInclude,
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return serializeOrder(created);
  });
}

export async function getOrdersService(userId: number) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });

  return orders.map(serializeOrder);
}

export async function getOrderService(userId: number, orderId: number) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  });

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  return serializeOrder(order);
}
