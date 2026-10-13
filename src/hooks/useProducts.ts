import { useProductsQuery } from './queries/useProductsQuery';

// All products, for pages that filter them on the client (cart, favourites).
export const useProducts = () => {
  const { data, isLoading, isError } = useProductsQuery();

  return {
    products: data?.items ?? [],
    isLoading,
    error: isError ? 'Failed to load products' : '',
  };
};
