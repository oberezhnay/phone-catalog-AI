import React from 'react';
import * as favoritesApi from '@/api/favorites';
import { useAuth } from './AuthContext';
import { createRequiredContext } from '@/utils/createRequiredContext';
import {
  useFavoritesMutation,
  useFavoritesQuery,
} from '@/hooks/queries/useFavoritesQuery';

type FavoritesContextType = {
  favorites: number[];
  toggleFavorite: (id: number) => void;
};

const [FavoritesContext, useFavorites] =
  createRequiredContext<FavoritesContextType>('FavoritesProvider');

export { useFavorites };

export const FavoritesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { token, isAuthenticated } = useAuth();
  const { data: favorites = [] } = useFavoritesQuery(
    isAuthenticated ? token : null,
  );
  const { mutate } = useFavoritesMutation();

  const toggleFavorite = (id: number) => {
    if (!token) {
      return;
    }

    const isFavorite = favorites.includes(id);

    mutate({
      token,
      change: t =>
        isFavorite
          ? favoritesApi.removeFavorite(t, id)
          : favoritesApi.addFavorite(t, id),
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
