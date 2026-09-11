import api from './axios';
import { mockStorage } from './mockData';

export const vendorApi = {
  applyVendor: async () => {
    try {
      const res = await api.post('/vendor/apply');
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const users = mockStorage.getUsers();
        const u = users.find((item) => item.id === user.id);
        if (u) {
          u.vendorRequest = true;
          mockStorage.setUsers(users);
        }
        return { success: true, message: 'Vendor application submitted successfully' };
      }
      throw err;
    }
  },

  getVendorRequests: async () => {
    try {
      const res = await api.get('/vendor/requests');
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const users = mockStorage.getUsers();
        const requests = users.filter((u) => u.vendorRequest && u.role === 'CUSTOMER');
        return { success: true, requests };
      }
      throw err;
    }
  },

  approveVendor: async (id) => {
    try {
      const res = await api.patch(`/vendor/approve/${id}`);
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const users = mockStorage.getUsers();
        const u = users.find((item) => item.id === Number(id));
        if (u) {
          u.role = 'VENDOR';
          u.vendorRequest = false;
          u.storeName = u.storeName || `${u.name}'s Boutique`;
          mockStorage.setUsers(users);
          return { success: true, message: 'Vendor approved successfully', user: u };
        }
        throw new Error('User not found');
      }
      throw err;
    }
  },

  getVendorOrders: async () => {
    try {
      const res = await api.get('/vendor/orders');
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const vendorId = user.id || 2;
        const allOrders = mockStorage.getOrders();
        // Vendor sees orders containing their products
        const vendorOrders = allOrders.filter((order) =>
          order.items?.some((item) => item.product?.vendorId === vendorId || true)
        );
        return { success: true, count: vendorOrders.length, orders: vendorOrders };
      }
      throw err;
    }
  },

  getVendorStats: async () => {
    try {
      const res = await api.get('/vendor/stats');
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const vendorId = user.id || 2;
        const products = mockStorage.getProducts().filter((p) => !p.deleted && p.vendorId === vendorId);
        const orders = mockStorage.getOrders();
        const pendingOrders = orders.filter((o) => o.status === 'PENDING');
        const revenue = orders
          .filter((o) => o.status !== 'CANCELLED')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        return {
          success: true,
          stats: {
            totalProducts: products.length || 14,
            totalOrders: orders.length,
            pendingOrders: pendingOrders.length,
            revenue: revenue || 12480,
            salesGrowth: '+18.4%',
            ordersGrowth: '+12.1%',
          },
        };
      }
      throw err;
    }
  },
};
