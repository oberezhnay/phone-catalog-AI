import { http } from './http';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  priceAtPurchase: number;
  product: {
    id: number;
    itemId: string;
    category: string;
    name: string;
    image: string;
  };
};

export type Order = {
  id: number;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

export async function createOrder(token: string): Promise<Order> {
  return http<Order>('/orders', {
    method: 'POST',
    token,
  });
}

export async function getOrders(token: string): Promise<Order[]> {
  return http<Order[]>('/orders', { token });
}

export async function getOrder(token: string, id: number): Promise<Order> {
  return http<Order>(`/orders/${id}`, { token });
}
