import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { Order, OrderItem, OrderStatus, Product } from '@prisma/client';

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

// A regular user only sees their own orders; an admin sees any order.
export async function getOrderService(
  userId: number,
  orderId: number,
  isAdmin = false,
) {
  const order = await prisma.order.findFirst({
    where: isAdmin ? { id: orderId } : { id: orderId, userId },
    include: orderInclude,
  });

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  return serializeOrder(order);
}

const adminOrderInclude = {
  ...orderInclude,
  user: { select: { id: true, email: true, name: true } },
} as const;

export async function getAdminOrdersService(status?: OrderStatus) {
  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: adminOrderInclude,
    orderBy: { createdAt: 'desc' },
  });

  return orders.map(order => ({ ...serializeOrder(order), user: order.user }));
}

export async function updateOrderStatusService(
  orderId: number,
  status: OrderStatus,
) {
  // A missing order surfaces as Prisma P2025, which errorHandler maps to 404.
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: adminOrderInclude,
  });

  return { ...serializeOrder(order), user: order.user };
}
