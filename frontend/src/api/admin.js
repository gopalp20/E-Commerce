import api from "./axios";

export const adminApi = {
  getVendors: () => api.get("/admin/vendors"),
  getAdminStats: () => api.get("/admin/stats"),
  getUsers: (params = {}) => api.get("/admin/users", { params }),
  updateUserRole: (userId, role) =>
    api.patch(`/admin/users/${userId}/role`, { role }),
  getAdminOrders: (params = {}) => api.get("/admin/orders", { params }),
  getAdminProducts: (params = {}) => api.get("/admin/products", { params }),
  archiveProduct: (productId) => api.delete(`/products/${productId}`),
  updateOrderStatus: (orderId, status) =>
    api.patch(`/admin/orders/${orderId}/status`, { status }),
};
