import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as favoritesApi from '@/api/favorites';

export const favoritesQueryKey = (token: string | null) =>
  ['favorites', token] as const;

// Favourite product ids for the signed-in user. Disabled without a token.
export function useFavoritesQuery(token: string | null) {
  return useQuery({
    queryKey: favoritesQueryKey(token),
    queryFn: () => favoritesApi.getFavorites(token as string),
    enabled: !!token,
  });
}

type FavoritesChange = (token: string) => Promise<number[]>;

export function useFavoritesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      change,
    }: {
      token: string;
      change: FavoritesChange;
    }) => change(token),
    onSuccess: (ids, { token }) => {
      queryClient.setQueryData(favoritesQueryKey(token), ids);
    },
  });
}
