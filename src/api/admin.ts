import { http } from './http';
import { AdminProduct, AdminProductInput } from '../types/AdminProduct';

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const data = await http<{ items: AdminProduct[]; total: number }>(
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
