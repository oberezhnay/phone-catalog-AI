import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';

function serializeReview(review: {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { id: number; name: string };
}) {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    user: review.user,
  };
}

export async function getProductReviewsService(productId: number) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const count = reviews.length;
  const average =
    count === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / count;

  return {
    reviews: reviews.map(serializeReview),
    average,
    count,
  };
}

export async function upsertReviewService(
  userId: number,
  productId: number,
  rating: number,
  comment?: string,
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const review = await prisma.review.upsert({
    where: { productId_userId: { productId, userId } },
    update: { rating, comment },
    create: { productId, userId, rating, comment },
    include: { user: { select: { id: true, name: true } } },
  });

  return serializeReview(review);
}

export async function deleteReviewService(userId: number, reviewId: number) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review || review.userId !== userId) {
    throw ApiError.notFound('Review not found');
  }

  await prisma.review.delete({ where: { id: reviewId } });
}
