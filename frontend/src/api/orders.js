import api from "./axios";

export const ordersApi = {
  createOrder: (details) => api.post("/orders", details),
  getMyOrders: () => api.get("/orders/my-orders"),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),
  getVendorOrders: () => api.get("/orders/vendor"),
  updateOrderStatus: (orderId, status) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const endpoint =
      user.role === "ADMIN"
        ? `/admin/orders/${orderId}/status`
        : `/orders/${orderId}/status`;
    return api.patch(endpoint, { status });
  },
};
