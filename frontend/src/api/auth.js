import api from './axios';
import { mockStorage } from './mockData';

export const authApi = {
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      return res;
    } catch (err) {
      // Graceful fallback to mock data if backend not reachable
      if (!err.response || err.code === 'ERR_NETWORK') {
        const users = mockStorage.getUsers();
        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          const token = `mock-jwt-token-${user.id}-${user.role}`;
          return {
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
          };
        }
        throw new Error('Invalid email or password (demo: check sample credentials)');
      }
      throw err;
    }
  },

  register: async ({ name, email, password, role = 'CUSTOMER' }) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const users = mockStorage.getUsers();
        if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('User with this email already exists.');
        }
        const newUser = {
          id: Date.now(),
          name,
          email,
          role: role === 'VENDOR' ? 'VENDOR' : 'CUSTOMER',
          createdAt: new Date().toISOString(),
          vendorRequest: false,
        };
        users.push(newUser);
        mockStorage.setUsers(users);
        const token = `mock-jwt-token-${newUser.id}-${newUser.role}`;
        return {
          success: true,
          token,
          user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
        };
      }
      throw err;
    }
  },

  getMe: async () => {
    try {
      const res = await api.get('/auth/me');
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          return { success: true, user: JSON.parse(savedUser) };
        }
      }
      throw err;
    }
  },
};
