import { useQuery } from '@tanstack/react-query';
import { getProducts, GetProductsParams } from '../../api/products';

export function useProductsQuery(params?: GetProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
  });
}
