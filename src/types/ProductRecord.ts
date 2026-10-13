import { ProductCategory } from './ProductCategory';

export type DescriptionBlock = {
  title: string;
  text: string[];
};

// A product row as the API returns it. Other product types are derived from this.
export type ProductRecord = {
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
