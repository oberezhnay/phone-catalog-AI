import { http } from './http';

export type Review = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
};

export type ProductReviews = {
  reviews: Review[];
  average: number;
  count: number;
};

export async function getReviews(productId: number): Promise<ProductReviews> {
  return http<ProductReviews>(`/reviews?productId=${productId}`);
}

export async function upsertReview(
  token: string,
  productId: number,
  rating: number,
  comment: string,
): Promise<Review> {
  return http<Review>('/reviews', {
    method: 'POST',
    token,
    body: JSON.stringify({ productId, rating, comment: comment || undefined }),
  });
}

export async function deleteReview(token: string, id: number): Promise<void> {
  return http<void>(`/reviews/${id}`, {
    method: 'DELETE',
    token,
  });
}
