import { prisma } from '../../lib/prisma.js';
import { CreateProductInput, GetProductsQuery, UpdateProductInput } from './products.schema.js';
import { ApiError } from '../../utils/ApiError.js';

export async function getProductsService(query: GetProductsQuery) {
  const { category, sort, page = 1, perPage = 'all', search } = query;

  const where: any = {};

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

  // Sorting
  const orderBy: any = {};
  switch (sort) {
    case 'title':
      orderBy.name = 'asc';
      break;
    case 'price':
      orderBy.priceDiscount = 'asc';
      break;
    case 'age':
      orderBy.year = 'desc';
      break;
  }

  // Pagination
  const itemsPerPage = perPage === 'all' ? total : parseInt(perPage);
  const skip = (page - 1) * itemsPerPage;
  const take = perPage === 'all' ? undefined : itemsPerPage;

  const items = await prisma.product.findMany({
    where,
    orderBy: Object.keys(orderBy).length > 0 ? orderBy : undefined,
    skip,
    take,
  });

  // Map to list format (fullPrice/price instead of priceRegular/priceDiscount)
  const mappedItems = items.map((product) => ({
    ...product,
    fullPrice: product.priceRegular,
    price: product.priceDiscount,
  }));

  return {
    items: mappedItems,
    total,
  };
}

export async function getProductDetailService(category: string, itemId: string) {
  const product = await prisma.product.findFirst({
    where: {
      category: category as any,
      itemId,
    },
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
  // Check if itemId already exists
  const existing = await prisma.product.findUnique({
    where: { itemId: data.itemId },
  });

  if (existing) {
    throw ApiError.conflict('Product with this itemId already exists');
  }

  return prisma.product.create({
    data: {
      ...data,
      category: data.category as any,
    },
  });
}

export async function updateProductService(id: number, data: UpdateProductInput) {
  // Check if itemId is being changed to an existing one
  if (data.itemId) {
    const existing = await prisma.product.findFirst({
      where: {
        itemId: data.itemId,
        id: { not: id },
      },
    });

    if (existing) {
      throw ApiError.conflict('Product with this itemId already exists');
    }
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...data,
      category: data.category as any,
    },
  });
}

export async function deleteProductService(id: number) {
  return prisma.product.delete({
    where: { id },
  });
}
