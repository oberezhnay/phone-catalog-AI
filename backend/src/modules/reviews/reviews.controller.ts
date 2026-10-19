import { asyncHandler, NoParams } from '../../utils/asyncHandler.js';
import {
  getProductReviewsService,
  upsertReviewService,
  deleteReviewService,
} from './reviews.service.js';
import { ReviewsQuery, UpsertReviewInput } from './reviews.schema.js';

export const getReviews = asyncHandler(async (req, res) => {
  // Validated by reviewsQuerySchema (validate(..., 'query') in the routes)
  const { productId } = req.query as unknown as ReviewsQuery;
  res.json(await getProductReviewsService(productId));
});

export const upsertReview = asyncHandler<
  NoParams,
  unknown,
  UpsertReviewInput,
  unknown
>(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const review = await upsertReviewService(
    req.user!.id,
    productId,
    rating,
    comment,
  );

  res.status(201).json(review);
});

export const deleteReview = asyncHandler<
  { id: string },
  unknown,
  unknown,
  unknown
>(async (req, res) => {
  await deleteReviewService(req.user!.id, Number(req.params.id));
  res.status(204).send();
});
