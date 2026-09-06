import { useEffect, useState } from 'react';
import { Product } from '../types/Product';
import { getProducts } from '../api/products';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProducts()
      .then(data => setProducts(data.items))
      .catch(() => setError('Failed to load products'))
      .finally(() => setIsLoading(false));
  }, []);

  return { products, isLoading, error };
};
