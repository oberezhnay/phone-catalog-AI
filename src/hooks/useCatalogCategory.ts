import { useParams } from 'react-router-dom';
import { isProductCategory, ProductCategory } from '@/types/ProductCategory';

// The category from the URL, or null when the URL names an unknown category.
export const useCatalogCategory = (): ProductCategory | null => {
  const { category } = useParams();

  return isProductCategory(category) ? category : null;
};
