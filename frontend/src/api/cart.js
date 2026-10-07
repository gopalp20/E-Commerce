import api from './axios';

const GUEST_CART_KEY = 'guest_cart';

const getLocalGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '{"items":[]}');
  } catch {
    return { items: [] };
  }
};

const setLocalGuestCart = (cart) => localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
const isCustomer = () => Boolean(localStorage.getItem('token')) && JSON.parse(localStorage.getItem('user') || '{}').role === 'CUSTOMER';
const getServerCart = async () => {
  const response = await api.get('/cart');
  return { success: true, cart: response.cart || { items: [] } };
};

export const cartApi = {
  getCart: () => isCustomer() ? getServerCart() : Promise.resolve({ success: true, cart: getLocalGuestCart() }),

  addToCart: async (productId, quantity = 1, productDetails = null) => {
    if (isCustomer()) {
      await api.post('/cart/items', { productId: Number(productId), quantity: Number(quantity) });
      return getServerCart();
    }
    const cart = getLocalGuestCart();
    const existing = cart.items.find((item) => item.productId === Number(productId));
    if (existing) existing.quantity += Number(quantity);
    else cart.items.push({ id: Date.now(), productId: Number(productId), quantity: Number(quantity), product: productDetails || { id: Number(productId), name: 'Selected Product', price: 0 } });
    setLocalGuestCart(cart);
    return { success: true, cart };
  },

  updateCartItem: async (itemId, quantity) => {
    if (isCustomer()) {
      await api.put(`/cart/items/${itemId}`, { quantity: Number(quantity) });
      return getServerCart();
    }
    const cart = getLocalGuestCart();
    const item = cart.items.find((entry) => entry.id === Number(itemId));
    if (item) item.quantity = Math.max(1, Number(quantity));
    setLocalGuestCart(cart);
    return { success: true, cart };
  },

  removeCartItem: async (itemId) => {
    if (isCustomer()) {
      await api.delete(`/cart/items/${itemId}`);
      return getServerCart();
    }
    const cart = getLocalGuestCart();
    cart.items = cart.items.filter((item) => item.id !== Number(itemId));
    setLocalGuestCart(cart);
    return { success: true, cart };
  },

  clearCart: async () => {
    if (isCustomer()) {
      await api.delete('/cart');
      return { success: true, cart: { items: [] } };
    }
    setLocalGuestCart({ items: [] });
    return { success: true, cart: { items: [] } };
  },

  syncGuestCart: async () => {
    if (!isCustomer()) return;
    const guestCart = getLocalGuestCart();
    for (const item of guestCart.items || []) {
      await api.post('/cart/items', { productId: Number(item.productId), quantity: Number(item.quantity) });
      const remaining = getLocalGuestCart();
      remaining.items = remaining.items.filter((entry) => entry.id !== item.id);
      setLocalGuestCart(remaining);
    }
  },
};
