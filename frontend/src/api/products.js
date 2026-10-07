import api from './axios';

export const productsApi = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getMyProducts: () => api.get('/products/my-products'),
  createProduct: (productData) => api.post('/products', {
    ...productData,
    price: Number(productData.price),
    stock: Number(productData.stock),
    categoryId: Number(productData.categoryId),
  }),
  updateProduct: (id, productData) => api.put(`/products/${id}`, {
    ...productData,
    ...(productData.price !== undefined && { price: Number(productData.price) }),
    ...(productData.stock !== undefined && { stock: Number(productData.stock) }),
    ...(productData.categoryId !== undefined && { categoryId: Number(productData.categoryId) }),
  }),
  increaseStock: (id, quantity) => api.patch(`/products/${id}/stock`, { quantity: Number(quantity) }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};
