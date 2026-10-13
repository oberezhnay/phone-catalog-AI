import React, { useEffect, useState } from 'react';
import * as favoritesApi from '../api/favorites';
import { useAuth } from './AuthContext';
import { createRequiredContext } from '../utils/createRequiredContext';

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
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setFavorites([]);

      return;
    }

    favoritesApi
      .getFavorites(token)
      .then(setFavorites)
      .catch(() => setFavorites([]));
  }, [isAuthenticated, token]);

  const toggleFavorite = (id: number) => {
    if (!token) {
      return;
    }

    const request = favorites.includes(id)
      ? favoritesApi.removeFavorite(token, id)
      : favoritesApi.addFavorite(token, id);

    request.then(setFavorites);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
