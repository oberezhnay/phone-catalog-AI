import { PrismaClient, ProductCategory } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface ProductListItem {
  id: number;
  category: string;
  itemId: string;
  name: string;
  fullPrice: number;
  price: number;
  screen: string;
  capacity: string;
  color: string;
  ram: string;
  year: number;
  image: string;
}

interface Description {
  title: string;
  text: string[];
}

interface ProductDetail {
  id: string;
  category: string;
  namespaceId: string;
  name: string;
  capacityAvailable: string[];
  capacity: string;
  priceRegular: number;
  priceDiscount: number;
  colorsAvailable: string[];
  color: string;
  images: string[];
  description: Description[];
  screen: string;
  resolution: string;
  processor: string;
  ram: string;
  camera: string;
  zoom: string;
  cell: string[];
  year: number;
}

async function seed() {
  try {
    console.log('Starting seed...');

    // Clear existing data
    await prisma.review.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();

    console.log('Cleared existing data');

    // Read product list from products.json
    const productsPath = path.join(__dirname, '../..', 'public/api/products.json');
    const productsJson = fs.readFileSync(productsPath, 'utf-8');
    const productsList: ProductListItem[] = JSON.parse(productsJson);

    console.log(`Found ${productsList.length} products in products.json`);

    // Read detail JSONs
    const detailMap = new Map<string, ProductDetail>();

    for (const category of ['phones', 'tablets', 'accessories']) {
      const detailPath = path.join(__dirname, '../..', `public/api/${category}.json`);
      if (fs.existsSync(detailPath)) {
        const detailJson = fs.readFileSync(detailPath, 'utf-8');
        const details: ProductDetail[] = JSON.parse(detailJson);

        details.forEach((detail) => {
          detailMap.set(detail.id, detail);
        });

        console.log(`Loaded ${details.length} ${category} details`);
      }
    }

    // Merge and insert products
    let matched = 0;
    let unmatched = 0;

    for (const listItem of productsList) {
      const detail = detailMap.get(listItem.itemId);

      if (!detail) {
        console.warn(`No detail found for itemId: ${listItem.itemId}`);
        unmatched++;
        continue;
      }

      await prisma.product.create({
        data: {
          id: listItem.id,
          itemId: listItem.itemId,
          namespaceId: detail.namespaceId,
          category: (listItem.category as ProductCategory).toLowerCase() as ProductCategory,
          name: detail.name,
          capacity: detail.capacity,
          capacityAvailable: detail.capacityAvailable,
          color: detail.color,
          colorsAvailable: detail.colorsAvailable,
          priceRegular: detail.priceRegular,
          priceDiscount: detail.priceDiscount,
          screen: detail.screen,
          resolution: detail.resolution || null,
          processor: detail.processor || null,
          ram: detail.ram,
          camera: detail.camera || null,
          zoom: detail.zoom || null,
          cell: detail.cell || [],
          year: detail.year || listItem.year,
          image: `/${listItem.image}`,
          images: detail.images.map(img => `/${img}`),
          description: detail.description,
          stock: 20,
        },
      });

      matched++;
    }

    console.log(`✓ Seeded ${matched} products (${unmatched} unmatched)`);

    // Reset identity sequence for future inserts
    const lastProduct = await prisma.product.findFirst({
      orderBy: { id: 'desc' },
    });

    if (lastProduct) {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"Product"', 'id'), ${lastProduct.id})`,
      );
      console.log(`✓ Reset identity sequence to ${lastProduct.id}`);
    }

    console.log('✓ Seed completed successfully');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
