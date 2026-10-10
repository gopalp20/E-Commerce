import api from "./axios";

export const productsApi = {
  restoreProduct: (id) => api.patch(`/products/${id}/restore`),
  uploadImage: (file) =>
    api.post("/media/images", file, {
      headers: { "Content-Type": file.type },
      timeout: 30000,
    }),
  getProducts: (params = {}) => api.get("/products", { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getMyProducts: () => api.get("/products/my-products"),
  createProduct: (productData) =>
    api.post("/products", {
      ...productData,
      price: Number(productData.price),
      stock: Number(productData.stock),
      categoryId: Number(productData.categoryId),
    }),
  updateProduct: (id, productData) =>
    api.put(`/products/${id}`, {
      ...productData,
      ...(productData.price !== undefined && {
        price: Number(productData.price),
      }),
      ...(productData.stock !== undefined && {
        stock: Number(productData.stock),
      }),
      ...(productData.categoryId !== undefined && {
        categoryId: Number(productData.categoryId),
      }),
    }),
  increaseStock: (id, quantity) =>
    api.patch(`/products/${id}/stock`, { quantity: Number(quantity) }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};
