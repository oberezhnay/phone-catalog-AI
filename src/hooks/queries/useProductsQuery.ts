import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../api/products';

interface UseProductsQueryParams {
  category?: string;
  sort?: string;
  page?: number;
  perPage?: string;
  search?: string;
}

export function useProductsQuery(params?: UseProductsQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
  });
}
