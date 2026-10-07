import api from './axios';

export const vendorApi = {
  applyVendor: () => api.post('/vendor/apply'),
  getVendorRequests: () => api.get('/vendor/requests'),
  approveVendor: (id) => api.patch(`/vendor/approve/${id}`),
  getVendorOrders: () => api.get('/orders/vendor'),
  getVendorStats: async () => {
    const [productsResult, ordersResult] = await Promise.all([
      api.get('/products/my-products'),
      api.get('/orders/vendor'),
    ]);
    const products = productsResult.products || [];
    const orders = ordersResult.orders || [];
    return {
      success: true,
      stats: {
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((order) => order.status === 'PENDING').length,
        revenue: orders.filter((order) => order.status !== 'CANCELLED')
          .reduce((sum, order) => sum + (order.items || []).reduce(
            (itemSum, item) => itemSum + Number(item.price || 0) * Number(item.quantity || 0), 0,
          ), 0),
      },
    };
  },
};
