import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getSessionId } from '../utils/session';
import * as api from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [sessionId] = useState(getSessionId());
  const [cart, setCart] = useState({ itemCount: 0, subtotal: 0, items: [] });
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.fetchCart(sessionId);
      setCart(res.cart);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId, quantity = 1, source = 'manual', productName) => {
    try {
      const res = await api.addCartItem(sessionId, { productId, quantity, source });
      setCart(res.cart);
      toast.success(`${productName || 'Item'} added to cart`);
    } catch (err) {
      toast.error('Could not add item to cart');
    }
  };

  const removeItem = async (productId, productName) => {
    try {
      const res = await api.removeCartItem(sessionId, productId);
      setCart(res.cart);
      toast(`${productName || 'Item'} removed`, { icon: '🗑️' });
    } catch (err) {
      toast.error('Could not remove item');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await api.updateCartItem(sessionId, productId, quantity);
      setCart(res.cart);
    } catch (err) {
      toast.error('Could not update quantity');
    }
  };

  const emptyCart = async () => {
    try {
      const res = await api.clearCart(sessionId);
      setCart(res.cart);
    } catch (err) {
      toast.error('Could not clear cart');
    }
  };

  return (
    <CartContext.Provider
      value={{
        sessionId,
        cart,
        loading,
        drawerOpen,
        setDrawerOpen,
        refreshCart,
        addItem,
        removeItem,
        updateQuantity,
        emptyCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
