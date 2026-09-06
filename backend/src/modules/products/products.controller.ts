import { Request, Response, NextFunction } from 'express';
import { getProductsService, getProductDetailService, createProductService, updateProductService, deleteProductService } from './products.service.js';
import { GetProductsQuery } from './products.schema.js';
import { ApiError } from '../../utils/ApiError.js';

export async function getProducts(
  req: Request<{}, {}, {}, GetProductsQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { category, sort, page, perPage, search } = req.query;

    const result = await getProductsService({
      category,
      sort,
      page,
      perPage,
      search,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getProductDetail(
  req: Request<{ category: string; itemId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { category, itemId } = req.params;

    const product = await getProductDetailService(category, itemId);

    if (!product) {
      next(ApiError.notFound('Product not found'));
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const product = await createProductService(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const product = await updateProductService(parseInt(id), req.body);

    if (!product) {
      next(ApiError.notFound('Product not found'));
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    await deleteProductService(parseInt(id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
