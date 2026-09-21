import { http } from './http';

export async function getFavorites(token: string): Promise<number[]> {
  return http<number[]>('/favorites', { token });
}

export async function addFavorite(
  token: string,
  productId: number,
): Promise<number[]> {
  return http<number[]>('/favorites', {
    method: 'POST',
    token,
    body: JSON.stringify({ productId }),
  });
}

export async function removeFavorite(
  token: string,
  productId: number,
): Promise<number[]> {
  return http<number[]>(`/favorites/${productId}`, {
    method: 'DELETE',
    token,
  });
}
