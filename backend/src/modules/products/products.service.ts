import { Prisma, ProductCategory } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import {
  CreateProductInput,
  GetProductsQuery,
  UpdateProductInput,
} from './products.schema.js';
import { ApiError } from '../../utils/ApiError.js';

const DUPLICATE_ITEM_ID = 'Product with this itemId already exists';

const ORDER_BY: Record<
  Exclude<GetProductsQuery['sort'], 'discount' | undefined>,
  Prisma.ProductOrderByWithRelationInput
> = {
  title: { name: 'asc' },
  price: { priceDiscount: 'asc' },
  'price-desc': { priceDiscount: 'desc' },
  age: { year: 'desc' },
};

type PricedProduct = {
  id: number;
  priceRegular: number;
  priceDiscount: number;
};

const discountPercent = (product: PricedProduct) =>
  (product.priceRegular - product.priceDiscount) / product.priceRegular;

// Largest percent off first; ties by id so pages stay stable.
const byDiscount = (a: PricedProduct, b: PricedProduct) =>
  discountPercent(b) - discountPercent(a) || a.id - b.id;

// itemId is unique; the database rejects a duplicate, so no pre-check is needed.
function rethrowDuplicateItemId(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw ApiError.conflict(DUPLICATE_ITEM_ID);
  }
  throw error;
}

export async function getProductsService(query: GetProductsQuery) {
  const { category, sort, page, perPage, search } = query;

  const where: Prisma.ProductWhereInput = {};

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { itemId: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Get total count for pagination
  const total = await prisma.product.count({ where });

  // Pagination
  const itemsPerPage = perPage === 'all' ? total : Number(perPage);
  const skip = (page - 1) * itemsPerPage;
  const take = perPage === 'all' ? undefined : itemsPerPage;

  // The database cannot order by a computed percentage, so the discount sort
  // loads every matching row (the catalog is small) and pages in memory.
  const items =
    sort === 'discount'
      ? (await prisma.product.findMany({ where }))
          .sort(byDiscount)
          .slice(skip, take === undefined ? undefined : skip + take)
      : await prisma.product.findMany({
          where,
          orderBy: sort ? ORDER_BY[sort] : undefined,
          skip,
          take,
        });

  // Map to list format (fullPrice/price instead of priceRegular/priceDiscount)
  const mappedItems = items.map(product => ({
    ...product,
    fullPrice: product.priceRegular,
    price: product.priceDiscount,
  }));

  return {
    items: mappedItems,
    total,
  };
}

export async function getProductDetailService(
  category: ProductCategory,
  itemId: string,
) {
  const product = await prisma.product.findFirst({
    where: { category, itemId },
  });

  if (!product) {
    return null;
  }

  // Add productId field for consistency
  return {
    ...product,
    productId: product.id,
  };
}

export async function createProductService(data: CreateProductInput) {
  return prisma.product.create({ data }).catch(rethrowDuplicateItemId);
}

export async function updateProductService(
  id: number,
  data: UpdateProductInput,
) {
  return prisma.product
    .update({ where: { id }, data })
    .catch(rethrowDuplicateItemId);
}

export async function deleteProductService(id: number) {
  return prisma.product.delete({
    where: { id },
  });
}
