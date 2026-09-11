import api from './axios';
import { mockStorage } from './mockData';

export const cartApi = {
  getCart: async () => {
    try {
      const res = await api.get('/cart');
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const cart = mockStorage.getCart();
        return { success: true, cart };
      }
      throw err;
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const res = await api.post('/cart/items', { productId, quantity });
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const cart = mockStorage.getCart();
        const products = mockStorage.getProducts();
        const product = products.find((p) => p.id === Number(productId));
        if (!product) throw new Error('Product not found');

        const existingIndex = cart.items.findIndex((item) => item.productId === Number(productId));
        if (existingIndex !== -1) {
          cart.items[existingIndex].quantity += quantity;
        } else {
          cart.items.push({
            id: Date.now(),
            productId: Number(productId),
            quantity,
            product,
          });
        }

        mockStorage.setCart(cart);
        return { success: true, cart };
      }
      throw err;
    }
  },

  updateCartItem: async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const cart = mockStorage.getCart();
        const item = cart.items.find((i) => i.id === Number(itemId));
        if (item) {
          item.quantity = Math.max(1, quantity);
          mockStorage.setCart(cart);
          return { success: true, cart };
        }
        throw new Error('Cart item not found');
      }
      throw err;
    }
  },

  removeCartItem: async (itemId) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const cart = mockStorage.getCart();
        cart.items = cart.items.filter((i) => i.id !== Number(itemId));
        mockStorage.setCart(cart);
        return { success: true, cart };
      }
      throw err;
    }
  },

  clearCart: async () => {
    try {
      const res = await api.delete('/cart');
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const cart = { items: [] };
        mockStorage.setCart(cart);
        return { success: true, cart };
      }
      throw err;
    }
  },
};
