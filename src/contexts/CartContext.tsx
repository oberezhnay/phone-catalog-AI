import React from 'react';
import * as cartApi from '@/api/cart';
import { useAuth } from './AuthContext';
import { createRequiredContext } from '@/utils/createRequiredContext';
import { useCartMutation, useCartQuery } from '@/hooks/queries/useCartQuery';
import { CartItem } from '@/types/Cart';

type CartContextType = {
  cart: CartItem[];
  toggleCart: (id: number) => void;
  removeFromCart: (id: number) => void;
  increase: (id: number) => void;
  decrease: (id: number) => void;
  clearCart: () => void;
};

const [CartContext, useCart] =
  createRequiredContext<CartContextType>('CartProvider');

export { useCart };

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, isAuthenticated } = useAuth();
  const { data: cart = [] } = useCartQuery(isAuthenticated ? token : null);
  const { mutate } = useCartMutation();

  const change = (request: (token: string) => Promise<CartItem[]>) => {
    if (!token) {
      return;
    }

    mutate({ token, change: request });
  };

  const toggleCart = (id: number) => {
    const exists = cart.find(item => item.id === id);

    change(t =>
      exists ? cartApi.removeCartItem(t, id) : cartApi.addCartItem(t, id),
    );
  };

  const removeFromCart = (id: number) => {
    change(t => cartApi.removeCartItem(t, id));
  };

  const increase = (id: number) => {
    const item = cart.find(p => p.id === id);

    if (!item) {
      return;
    }

    change(t => cartApi.updateCartItem(t, id, item.qty + 1));
  };

  const decrease = (id: number) => {
    const item = cart.find(p => p.id === id);

    if (!item) {
      return;
    }

    change(t =>
      item.qty <= 1
        ? cartApi.removeCartItem(t, id)
        : cartApi.updateCartItem(t, id, item.qty - 1),
    );
  };

  const clearCart = () => {
    change(t => cartApi.clearCart(t));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        toggleCart,
        removeFromCart,
        increase,
        decrease,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
