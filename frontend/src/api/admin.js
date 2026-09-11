import api from './axios';
import { mockStorage } from './mockData';

export const adminApi = {
  getAdminStats: async () => {
    try {
      const res = await api.get('/admin/stats');
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const users = mockStorage.getUsers();
        const products = mockStorage.getProducts().filter((p) => !p.deleted);
        const orders = mockStorage.getOrders();
        const categories = mockStorage.getCategories();

        const totalRevenue = orders
          .filter((o) => o.status !== 'CANCELLED')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        const vendors = users.filter((u) => u.role === 'VENDOR');
        const customers = users.filter((u) => u.role === 'CUSTOMER');

        return {
          success: true,
          stats: {
            totalRevenue: totalRevenue || 38450.00,
            totalOrders: orders.length + 128,
            totalUsers: users.length + 420,
            totalVendors: vendors.length + 18,
            totalProducts: products.length + 84,
            totalCategories: categories.length,
            revenueGrowth: '+24.5%',
            ordersGrowth: '+16.2%',
            usersGrowth: '+31.8%',
            vendorsGrowth: '+8.3%',
          },
        };
      }
      throw err;
    }
  },

  getUsers: async (params = {}) => {
    try {
      const res = await api.get('/admin/users', { params });
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        let users = mockStorage.getUsers();
        if (params.role) {
          users = users.filter((u) => u.role === params.role);
        }
        if (params.search) {
          const q = params.search.toLowerCase();
          users = users.filter(
            (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
          );
        }
        return { success: true, count: users.length, users };
      }
      throw err;
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role });
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const users = mockStorage.getUsers();
        const u = users.find((item) => item.id === Number(userId));
        if (u) {
          u.role = role;
          mockStorage.setUsers(users);
          return { success: true, message: 'User role updated', user: u };
        }
        throw new Error('User not found');
      }
      throw err;
    }
  },

  getAdminOrders: async () => {
    try {
      const res = await api.get('/admin/orders');
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const orders = mockStorage.getOrders();
        return { success: true, count: orders.length, orders };
      }
      throw err;
    }
  },

  getAdminProducts: async () => {
    try {
      const res = await api.get('/admin/products');
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const products = mockStorage.getProducts();
        return { success: true, count: products.length, products };
      }
      throw err;
    }
  },
};
