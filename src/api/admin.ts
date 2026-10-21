import { http } from './http';
import { GetProductsResponse } from './products';
import { AdminProduct, AdminProductInput } from '@/types/AdminProduct';
import { Order, OrderStatus } from './orders';

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const data = await http<GetProductsResponse<AdminProduct>>(
    '/products?perPage=all',
  );

  return data.items;
}

export async function createAdminProduct(
  token: string,
  data: AdminProductInput,
): Promise<AdminProduct> {
  return http<AdminProduct>('/products', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function updateAdminProduct(
  token: string,
  id: number,
  data: Partial<AdminProductInput>,
): Promise<AdminProduct> {
  return http<AdminProduct>(`/products/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(data),
  });
}

export async function deleteAdminProduct(
  token: string,
  id: number,
): Promise<void> {
  return http<void>(`/products/${id}`, {
    method: 'DELETE',
    token,
  });
}

export type AdminOrder = Order & {
  user: { id: number; email: string; name: string };
};

export async function getAdminOrders(
  token: string,
  status?: OrderStatus,
): Promise<AdminOrder[]> {
  const query = status ? `?status=${status}` : '';

  return http<AdminOrder[]>(`/admin/orders${query}`, { token });
}

export async function updateAdminOrderStatus(
  token: string,
  id: number,
  status: OrderStatus,
): Promise<AdminOrder> {
  return http<AdminOrder>(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  });
}
