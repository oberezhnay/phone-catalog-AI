import { useQuery } from '@tanstack/react-query';
import { getProductDetails } from '../../api/products';

export function useProductDetailsQuery(category: string, itemId: string) {
  return useQuery({
    queryKey: ['product', category, itemId],
    queryFn: () => getProductDetails(category, itemId),
    enabled: !!category && !!itemId,
  });
}
