import api from "./axios";
export const savedApi = {
  list: () => api.get("/saved"),
  save: (id, fromBag = false) => api.put(`/saved/${id}`, { fromBag }),
  remove: (id) => api.delete(`/saved/${id}`),
  moveToBag: (id, quantity, expectedPrice) => api.post(`/saved/${id}/bag`, { quantity, expectedPrice }),
};
