import { http } from './http';
import { CartItem } from '../contexts/CartContext';

export async function getCart(token: string): Promise<CartItem[]> {
  return http<CartItem[]>('/cart', { token });
}

export async function addCartItem(
  token: string,
  productId: number,
): Promise<CartItem[]> {
  return http<CartItem[]>('/cart', {
    method: 'POST',
    token,
    body: JSON.stringify({ productId }),
  });
}

export async function updateCartItem(
  token: string,
  productId: number,
  qty: number,
): Promise<CartItem[]> {
  return http<CartItem[]>(`/cart/${productId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ qty }),
  });
}

export async function removeCartItem(
  token: string,
  productId: number,
): Promise<CartItem[]> {
  return http<CartItem[]>(`/cart/${productId}`, {
    method: 'DELETE',
    token,
  });
}

export async function clearCart(token: string): Promise<CartItem[]> {
  return http<CartItem[]>('/cart', {
    method: 'DELETE',
    token,
  });
}
