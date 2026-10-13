import { Router } from 'express';
import {
  getReviews,
  upsertReview,
  deleteReview,
} from './reviews.controller.js';
import { validate } from '../../middleware/validate.js';
import { reviewsQuerySchema, upsertReviewSchema } from './reviews.schema.js';
import { idParamsSchema } from '../../utils/schemas.js';
import { auth } from '../../middleware/auth.js';

export const reviewsRouter = Router();

reviewsRouter.get('/api/reviews', validate(reviewsQuerySchema, 'query'), getReviews);
reviewsRouter.post('/api/reviews', auth, validate(upsertReviewSchema), upsertReview);
reviewsRouter.delete(
  '/api/reviews/:id',
  auth,
  validate(idParamsSchema, 'params'),
  deleteReview,
);
