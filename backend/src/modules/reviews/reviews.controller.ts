import { Request, Response, NextFunction } from 'express';
import {
  getProductReviewsService,
  upsertReviewService,
  deleteReviewService,
} from './reviews.service.js';
import { ApiError } from '../../utils/ApiError.js';

export async function getReviews(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const productId = parseInt(req.query.productId as string);

    if (!productId) {
      throw ApiError.badRequest('productId is required');
    }

    const result = await getProductReviewsService(productId);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function upsertReview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { productId, rating, comment } = req.body;
    const review = await upsertReviewService(
      req.user!.id,
      productId,
      rating,
      comment,
    );

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteReviewService(req.user!.id, parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
