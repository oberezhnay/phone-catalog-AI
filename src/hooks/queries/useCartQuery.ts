import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as cartApi from '@/api/cart';
import { CartItem } from '@/types/Cart';

export const cartQueryKey = (token: string | null) => ['cart', token] as const;

// Cart for the signed-in user. Disabled (no request) when there is no token.
export function useCartQuery(token: string | null) {
  return useQuery({
    queryKey: cartQueryKey(token),
    queryFn: () => cartApi.getCart(token as string),
    enabled: !!token,
  });
}

type CartChange = (token: string) => Promise<CartItem[]>;

// Every cart change returns the full cart from the server, so it replaces the cache.
export function useCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, change }: { token: string; change: CartChange }) =>
      change(token),
    onSuccess: (items, { token }) => {
      queryClient.setQueryData(cartQueryKey(token), items);
    },
  });
}
