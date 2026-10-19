import { asyncHandler, NoParams } from '../../utils/asyncHandler.js';
import {
  getProductsService,
  getProductDetailService,
  createProductService,
  updateProductService,
  deleteProductService,
} from './products.service.js';
import {
  CreateProductInput,
  GetProductsQuery,
  ProductDetailParams,
  UpdateProductInput,
} from './products.schema.js';
import { ApiError } from '../../utils/ApiError.js';

export const getProducts = asyncHandler(async (req, res) => {
  // Validated by getProductsQuerySchema (validate(..., 'query') in the routes)
  res.json(await getProductsService(req.query as unknown as GetProductsQuery));
});

export const getProductDetail = asyncHandler<
  ProductDetailParams,
  unknown,
  unknown,
  unknown
>(async (req, res) => {
  const { category, itemId } = req.params;
  const product = await getProductDetailService(category, itemId);

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  res.json(product);
});

export const createProduct = asyncHandler<
  NoParams,
  unknown,
  CreateProductInput,
  unknown
>(async (req, res) => {
  const product = await createProductService(req.body);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler<
  { id: string },
  unknown,
  UpdateProductInput,
  unknown
>(async (req, res) => {
  const product = await updateProductService(Number(req.params.id), req.body);
  res.json(product);
});

export const deleteProduct = asyncHandler<
  { id: string },
  unknown,
  unknown,
  unknown
>(async (req, res) => {
  await deleteProductService(Number(req.params.id));
  res.status(204).send();
});
