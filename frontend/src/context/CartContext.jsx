import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartApi } from '../api/cart';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const res = await cartApi.getCart();
      if (res.cart) {
        setCart(res.cart);
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const addToCart = async (product, quantity = 1) => {
    try {
      const res = await cartApi.addToCart(product.id, quantity);
      if (res.cart) {
        setCart(res.cart);
      }
      toast.success(`Added ${product.name} (x${quantity}) to your bag.`, 'Cart Updated');
    } catch (err) {
      toast.error('Could not add item to cart.');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await cartApi.updateCartItem(itemId, quantity);
      if (res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      toast.error('Could not update cart quantity.');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await cartApi.removeCartItem(itemId);
      if (res.cart) {
        setCart(res.cart);
      }
      toast.info('Item removed from cart.');
    } catch (err) {
      toast.error('Could not remove item.');
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartApi.clearCart();
      if (res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      toast.error('Could not clear cart.');
    }
  };

  const itemCount = (cart.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
  const subtotal = (cart.items || []).reduce(
    (acc, item) => acc + (Number(item.product?.price) || 0) * (item.quantity || 1),
    0
  );
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15.00;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const value = {
    cart,
    items: cart.items || [],
    itemCount,
    subtotal,
    shipping,
    tax,
    total,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
