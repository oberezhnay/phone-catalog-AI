import React, { createContext, useContext, useEffect, useState } from 'react';
import * as cartApi from '../api/cart';
import { useAuth } from './AuthContext';

export type CartItem = {
  id: number;
  qty: number;
};

type CartContextType = {
  cart: CartItem[];
  toggleCart: (id: number) => void;
  removeFromCart: (id: number) => void;
  increase: (id: number) => void;
  decrease: (id: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setCart([]);
      return;
    }

    cartApi
      .getCart(token)
      .then(setCart)
      .catch(() => setCart([]));
  }, [isAuthenticated, token]);

  const toggleCart = (id: number) => {
    if (!token) {
      return;
    }

    const exists = cart.find(item => item.id === id);
    const request = exists
      ? cartApi.removeCartItem(token, id)
      : cartApi.addCartItem(token, id);

    request.then(setCart);
  };

  const removeFromCart = (id: number) => {
    if (!token) {
      return;
    }

    cartApi.removeCartItem(token, id).then(setCart);
  };

  const increase = (id: number) => {
    if (!token) {
      return;
    }

    const item = cart.find(p => p.id === id);

    if (!item) {
      return;
    }

    cartApi.updateCartItem(token, id, item.qty + 1).then(setCart);
  };

  const decrease = (id: number) => {
    if (!token) {
      return;
    }

    const item = cart.find(p => p.id === id);

    if (!item) {
      return;
    }

    const request =
      item.qty <= 1
        ? cartApi.removeCartItem(token, id)
        : cartApi.updateCartItem(token, id, item.qty - 1);

    request.then(setCart);
  };

  const clearCart = () => {
    if (!token) {
      return;
    }

    cartApi.clearCart(token).then(setCart);
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

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('Cart Context Error');
  }

  return context;
};
