import { useQuery } from '@tanstack/react-query';
import { getAdminProducts } from '../../api/admin';

export function useAdminProductsQuery() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: getAdminProducts,
  });
}
