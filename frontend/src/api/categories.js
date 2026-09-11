import api from './axios';
import { mockStorage } from './mockData';

export const categoriesApi = {
  getCategories: async () => {
    try {
      const res = await api.get('/categories');
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const categories = mockStorage.getCategories();
        return { success: true, categories };
      }
      throw err;
    }
  },

  getCategoryById: async (id) => {
    try {
      const res = await api.get(`/categories/${id}`);
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const categories = mockStorage.getCategories();
        const category = categories.find((c) => c.id === Number(id));
        if (category) return { success: true, category };
        throw new Error('Category not found');
      }
      throw err;
    }
  },

  createCategory: async (categoryData) => {
    try {
      const res = await api.post('/categories', categoryData);
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const categories = mockStorage.getCategories();
        const newCat = {
          id: Date.now(),
          name: categoryData.name,
          slug: categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, '-'),
          count: 0,
          createdAt: new Date().toISOString(),
        };
        categories.push(newCat);
        mockStorage.setCategories(categories);
        return { success: true, category: newCat };
      }
      throw err;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const res = await api.put(`/categories/${id}`, categoryData);
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const categories = mockStorage.getCategories();
        const idx = categories.findIndex((c) => c.id === Number(id));
        if (idx !== -1) {
          categories[idx] = { ...categories[idx], ...categoryData };
          mockStorage.setCategories(categories);
          return { success: true, category: categories[idx] };
        }
        throw new Error('Category not found');
      }
      throw err;
    }
  },

  deleteCategory: async (id) => {
    try {
      const res = await api.delete(`/categories/${id}`);
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        let categories = mockStorage.getCategories();
        categories = categories.filter((c) => c.id !== Number(id));
        mockStorage.setCategories(categories);
        return { success: true, message: 'Category deleted' };
      }
      throw err;
    }
  },
};
