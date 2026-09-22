import { Router } from 'express';
import {
  getReviews,
  upsertReview,
  deleteReview,
} from './reviews.controller.js';
import { validate } from '../../middleware/validate.js';
import { upsertReviewSchema } from './reviews.schema.js';
import { auth, requireAuth } from '../../middleware/auth.js';

export const reviewsRouter = Router();

reviewsRouter.get('/api/reviews', getReviews);
reviewsRouter.post(
  '/api/reviews',
  auth,
  requireAuth,
  validate(upsertReviewSchema),
  upsertReview,
);
reviewsRouter.delete('/api/reviews/:id', auth, requireAuth, deleteReview);
