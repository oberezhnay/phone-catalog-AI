import { ProductCategory } from './ProductCategory';

export type DescriptionBlock = {
  title: string;
  text: string[];
};

export type AdminProduct = {
  id: number;
  itemId: string;
  namespaceId: string;
  category: ProductCategory;
  name: string;
  capacity: string;
  capacityAvailable: string[];
  color: string;
  colorsAvailable: string[];
  priceRegular: number;
  priceDiscount: number;
  screen: string;
  resolution: string | null;
  processor: string | null;
  ram: string;
  camera: string | null;
  zoom: string | null;
  cell: string[];
  year: number;
  image: string;
  images: string[];
  description: DescriptionBlock[];
  stock: number;
};

type NullableFields = 'resolution' | 'processor' | 'camera' | 'zoom';

// The write API (zod `.optional()`) accepts a missing key but not `null`,
// unlike the read shape above which comes back from Prisma as `string | null`.
export type AdminProductInput = Omit<AdminProduct, 'id' | NullableFields> & {
  [K in NullableFields]?: string;
};
