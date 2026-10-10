import api from "./axios";
const read = () => api.get("/cart");
export const cartApi = {
  getCart: read,
  addToCart: async (productId, quantity = 1) => {
    await api.post("/cart/items", { productId, quantity });
    return read();
  },
  updateCartItem: async (id, quantity) => {
    await api.put(`/cart/items/${id}`, { quantity });
    return read();
  },
  removeCartItem: async (id) => {
    await api.delete(`/cart/items/${id}`);
    return read();
  },
  clearCart: async () => {
    await api.delete("/cart");
    return { cart: { items: [] } };
  },
};
