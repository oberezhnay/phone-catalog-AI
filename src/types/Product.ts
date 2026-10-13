import { ProductRecord } from './ProductRecord';

type IdentityFields = 'id' | 'namespaceId' | 'category' | 'itemId' | 'name';
type CardFields = 'screen' | 'capacity' | 'color' | 'ram' | 'year' | 'image';

// A catalog list item: the fields the cards use, plus the price aliases
// that the list endpoint adds (fullPrice = priceRegular, price = priceDiscount).
export type Product = Pick<ProductRecord, IdentityFields | CardFields> & {
  fullPrice: number;
  price: number;
};
