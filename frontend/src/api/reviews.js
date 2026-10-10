import api from "./axios";
export const reviewsApi = {
  list: (productId, params) =>
    api.get(`/reviews/product/${productId}`, { params }),
  eligibility: (productId) => api.get(`/reviews/product/${productId}/me`),
  create: (productId, body) => api.post(`/reviews/product/${productId}`, body),
  update: (id, body) => api.put(`/reviews/${id}`, body),
  remove: (id) => api.delete(`/reviews/${id}`),
  helpful: (id, helpful) => api.put(`/reviews/${id}/helpful`, { helpful }),
  workspace: (role, params) => api.get(`/reviews/${role}`, { params }),
  moderate: (id, body) => api.patch(`/reviews/${id}/moderation`, body),
};
