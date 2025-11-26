import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, storageKeys } from '../services/storage';
import { CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'uuid' | 'quantidade'>) => void;
  updateQuantity: (uuid: string, quantity: number) => void;
  updateCartItem: (uuid: string, quantity: number, observation?: string) => void;
  removeFromCart: (uuid: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    saveCart();
  }, [cart]);

  const loadCart = async () => {
    try {
      const savedCart = await storage.getItem<CartItem[]>(storageKeys.CART);
      if (savedCart) {
        setCart(savedCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      await storage.setItem(storageKeys.CART, cart);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (item: Omit<CartItem, 'uuid' | 'quantidade'>) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.uuid === existingItem.uuid
            ? { ...cartItem, quantidade: cartItem.quantidade + 1 }
            : cartItem
        );
      }
      return [
        ...prevCart,
        {
          ...item,
          uuid: `${item.id}-${Date.now()}`,
          quantidade: 1,
        },
      ];
    });
  };

  const updateQuantity = (uuid: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(uuid);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.uuid === uuid ? { ...item, quantidade: quantity } : item))
    );
  };

  const updateCartItem = (uuid: string, quantity: number, observation?: string) => {
    if (quantity <= 0) {
      removeFromCart(uuid);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.uuid === uuid
          ? { ...item, quantidade: quantity, observacao: observation || item.observacao }
          : item
      )
    );
  };

  const removeFromCart = (uuid: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.uuid !== uuid));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotal = (): number => {
    return cart.reduce((total, item) => {
      const price = item.pv || item.preco;
      return total + price * item.quantidade;
    }, 0);
  };

  const getTotalItems = (): number => {
    return cart.reduce((total, item) => total + item.quantidade, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        updateCartItem,
        removeFromCart,
        clearCart,
        getTotal,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

