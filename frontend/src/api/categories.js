import api from "./axios";
const changed = async (promise) => {
  const result = await promise;
  window.dispatchEvent(new Event("forme:categories-changed"));
  return result;
};
export const categoriesApi = {
  getCategories: () => api.get("/categories"),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => changed(api.post("/categories", data)),
  updateCategory: (id, data) => changed(api.put(`/categories/${id}`, data)),
  deleteCategory: (id) => changed(api.delete(`/categories/${id}`)),
};
