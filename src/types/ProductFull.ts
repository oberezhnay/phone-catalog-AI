import { ProductRecord } from './ProductRecord';

// Product details response: the full product plus the numeric id that the
// cart and favourites use.
export type ProductDescription = ProductRecord & {
  productId: number;
};
