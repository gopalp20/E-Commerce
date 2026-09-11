import api from './axios';
import { mockStorage } from './mockData';

export const productsApi = {
  getProducts: async (params = {}) => {
    try {
      const res = await api.get('/products', { params });
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const allProducts = mockStorage.getProducts().filter((p) => !p.deleted);
        let filtered = [...allProducts];

        // Search filter
        if (params.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(
            (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
          );
        }

        // Category filter
        if (params.category) {
          filtered = filtered.filter(
            (p) =>
              p.category?.slug === params.category ||
              String(p.categoryId) === String(params.category)
          );
        }

        // Min price
        if (params.minPrice !== undefined && params.minPrice !== '') {
          filtered = filtered.filter((p) => Number(p.price) >= Number(params.minPrice));
        }

        // Max price
        if (params.maxPrice !== undefined && params.maxPrice !== '') {
          filtered = filtered.filter((p) => Number(p.price) <= Number(params.maxPrice));
        }

        // Rating filter
        if (params.rating) {
          filtered = filtered.filter((p) => (p.rating || 0) >= Number(params.rating));
        }

        // Sorting
        const sort = params.sort || 'newest';
        if (sort === 'price_asc') {
          filtered.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sort === 'price_desc') {
          filtered.sort((a, b) => Number(b.price) - Number(a.price));
        } else if (sort === 'rating_desc') {
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sort === 'name_asc') {
          filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === 'name_desc') {
          filtered.sort((a, b) => b.name.localeCompare(a.name));
        } else {
          // newest
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        // Pagination
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 12;
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const paginated = filtered.slice((page - 1) * limit, page * limit);

        return {
          success: true,
          products: paginated,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      }
      throw err;
    }
  },

  getProductById: async (id) => {
    try {
      const res = await api.get(`/products/${id}`);
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const allProducts = mockStorage.getProducts();
        const product = allProducts.find((p) => p.id === Number(id));
        if (product) return { success: true, product };
        throw new Error('Product not found');
      }
      throw err;
    }
  },

  getMyProducts: async () => {
    try {
      const res = await api.get('/products/my-products');
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const allProducts = mockStorage.getProducts().filter((p) => !p.deleted);
        const myProducts = user.role === 'ADMIN'
          ? allProducts
          : allProducts.filter((p) => p.vendorId === (user.id || 2));
        return { success: true, count: myProducts.length, products: myProducts };
      }
      throw err;
    }
  },

  createProduct: async (productData) => {
    try {
      const res = await api.post('/products', productData);
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const products = mockStorage.getProducts();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const categories = mockStorage.getCategories();
        const category = categories.find((c) => c.id === Number(productData.categoryId)) || {
          id: productData.categoryId,
          name: 'General',
          slug: 'general',
        };

        const newProd = {
          id: Date.now(),
          name: productData.name,
          description: productData.description,
          price: Number(productData.price),
          stock: Number(productData.stock),
          status: productData.status || (productData.stock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK'),
          deleted: false,
          categoryId: Number(productData.categoryId),
          category,
          vendorId: user.id || 2,
          vendor: { id: user.id || 2, name: user.storeName || user.name || 'Vendor Merchant' },
          imageUrl: productData.imageUrl || productData.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
          images: (productData.images || []).map((url, i) => ({ id: Date.now() + i, url })),
          rating: 5.0,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
        };

        products.unshift(newProd);
        mockStorage.setProducts(products);
        return { success: true, product: newProd };
      }
      throw err;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const res = await api.put(`/products/${id}`, productData);
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const products = mockStorage.getProducts();
        const idx = products.findIndex((p) => p.id === Number(id));
        if (idx !== -1) {
          const categories = mockStorage.getCategories();
          const category = productData.categoryId
            ? categories.find((c) => c.id === Number(productData.categoryId))
            : products[idx].category;

          products[idx] = {
            ...products[idx],
            ...productData,
            category: category || products[idx].category,
            price: productData.price !== undefined ? Number(productData.price) : products[idx].price,
            stock: productData.stock !== undefined ? Number(productData.stock) : products[idx].stock,
          };
          mockStorage.setProducts(products);
          return { success: true, message: 'Product updated successfully', product: products[idx] };
        }
        throw new Error('Product not found');
      }
      throw err;
    }
  },

  deleteProduct: async (id) => {
    try {
      const res = await api.delete(`/products/${id}`);
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const products = mockStorage.getProducts();
        const idx = products.findIndex((p) => p.id === Number(id));
        if (idx !== -1) {
          products[idx].deleted = true;
          products[idx].status = 'ARCHIVED';
          mockStorage.setProducts(products);
          return { success: true, message: 'Product archived successfully' };
        }
        throw new Error('Product not found');
      }
      throw err;
    }
  },
};
