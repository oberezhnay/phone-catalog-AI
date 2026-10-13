import { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { prismaMock } from '../../test/prismaMock.js';
import {
  createProductService,
  deleteProductService,
  getProductDetailService,
  getProductsService,
  updateProductService,
} from './products.service.js';

// Prisma's unique-constraint error, as thrown when itemId is already taken
const duplicateItemIdError = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
  });

const product = (overrides: Partial<{ id: number; itemId: string }> = {}) => ({
  id: 1,
  itemId: 'phone-1',
  namespaceId: 'phone',
  category: 'phones' as const,
  name: 'Phone 1',
  capacity: '128GB',
  capacityAvailable: ['128GB'],
  color: 'black',
  colorsAvailable: ['black'],
  priceRegular: 500,
  priceDiscount: 400,
  screen: '6"',
  resolution: null,
  processor: null,
  ram: '4GB',
  camera: null,
  zoom: null,
  cell: [],
  year: 2024,
  image: '/img.webp',
  images: [],
  description: [],
  stock: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('products.service', () => {
  describe('getProductsService', () => {
    it('maps priceRegular/priceDiscount to fullPrice/price for the list contract', async () => {
      prismaMock.product.count.mockResolvedValue(1);
      prismaMock.product.findMany.mockResolvedValue([product()] as never);

      const result = await getProductsService({ page: 1, perPage: 'all' });

      expect(result.total).toBe(1);
      expect(result.items[0].fullPrice).toBe(500);
      expect(result.items[0].price).toBe(400);
    });

    it('filters by category when provided', async () => {
      prismaMock.product.count.mockResolvedValue(0);
      prismaMock.product.findMany.mockResolvedValue([]);

      await getProductsService({ category: 'tablets', page: 1, perPage: 'all' });

      expect(prismaMock.product.count).toHaveBeenCalledWith({
        where: { category: 'tablets' },
      });
    });

    it('builds a case-insensitive OR search across name and itemId', async () => {
      prismaMock.product.count.mockResolvedValue(0);
      prismaMock.product.findMany.mockResolvedValue([]);

      await getProductsService({ search: 'iphone', page: 1, perPage: 'all' });

      expect(prismaMock.product.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'iphone', mode: 'insensitive' } },
            { itemId: { contains: 'iphone', mode: 'insensitive' } },
          ],
        },
      });
    });

    it.each([
      ['title', { name: 'asc' }],
      ['price', { priceDiscount: 'asc' }],
      ['age', { year: 'desc' }],
    ] as const)('sorts by %s using the matching column', async (sort, expectedOrderBy) => {
      prismaMock.product.count.mockResolvedValue(0);
      prismaMock.product.findMany.mockResolvedValue([]);

      await getProductsService({ sort, page: 1, perPage: 'all' });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: expectedOrderBy }),
      );
    });

    it('paginates with skip/take derived from page and perPage', async () => {
      prismaMock.product.count.mockResolvedValue(50);
      prismaMock.product.findMany.mockResolvedValue([]);

      await getProductsService({ page: 3, perPage: 8 });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 16, take: 8 }), // (3-1) * 8
      );
    });

    it('requests every row (no take, skip 0) when perPage is "all"', async () => {
      prismaMock.product.count.mockResolvedValue(50);
      prismaMock.product.findMany.mockResolvedValue([]);

      await getProductsService({ page: 1, perPage: 'all' });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: undefined }),
      );
    });
  });

  describe('getProductDetailService', () => {
    it('returns null when no product matches the category/itemId pair', async () => {
      prismaMock.product.findFirst.mockResolvedValue(null);

      await expect(getProductDetailService('phones', 'missing')).resolves.toBeNull();
    });

    it('adds a numeric productId field alongside the existing id', async () => {
      prismaMock.product.findFirst.mockResolvedValue(product({ id: 7 }) as never);

      const result = await getProductDetailService('phones', 'phone-1');

      expect(result?.id).toBe(7);
      expect(result?.productId).toBe(7);
    });
  });

  describe('createProductService', () => {
    it('maps a duplicate itemId (P2002) to a 409 conflict', async () => {
      prismaMock.product.create.mockRejectedValue(duplicateItemIdError());

      await expect(
        createProductService({ itemId: 'phone-1' } as never),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('rethrows other database errors unchanged', async () => {
      const failure = new Error('connection lost');
      prismaMock.product.create.mockRejectedValue(failure);

      await expect(createProductService({ itemId: 'phone-1' } as never)).rejects.toBe(failure);
    });

    it('creates the product and does not pre-check itemId', async () => {
      prismaMock.product.create.mockResolvedValue(product() as never);

      await createProductService({ itemId: 'phone-1', category: 'phones' } as never);

      expect(prismaMock.product.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.product.create).toHaveBeenCalled();
    });
  });

  describe('updateProductService', () => {
    it('maps renaming to an itemId used by another product (P2002) to a 409 conflict', async () => {
      prismaMock.product.update.mockRejectedValue(duplicateItemIdError());

      await expect(
        updateProductService(1, { itemId: 'taken-slug' } as never),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('updates by id without a separate uniqueness lookup', async () => {
      prismaMock.product.update.mockResolvedValue(product() as never);

      await updateProductService(1, { stock: 5 } as never);

      expect(prismaMock.product.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
    });
  });

  describe('deleteProductService', () => {
    it('deletes the product by id', async () => {
      prismaMock.product.delete.mockResolvedValue(product() as never);

      await deleteProductService(1);

      expect(prismaMock.product.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
