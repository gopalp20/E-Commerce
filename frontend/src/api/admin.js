import api from './axios';

export const adminApi = {
  getAdminStats: () => api.get('/admin/stats'),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  getAdminOrders: () => api.get('/admin/orders'),
  getAdminProducts: () => api.get('/admin/products'),
  archiveProduct: (productId) => api.delete(`/products/${productId}`),
  updateOrderStatus: (orderId, status) => api.patch(`/admin/orders/${orderId}/status`, { status }),
};
