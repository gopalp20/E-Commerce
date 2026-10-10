import api from "./axios";
export const addressesApi = {
  list: () => api.get("/addresses"),
  create: (input) => api.post("/addresses", input),
  update: (id, input) => api.put(`/addresses/${id}`, input),
  makeDefault: (id) => api.patch(`/addresses/${id}/default`),
  remove: (id) => api.delete(`/addresses/${id}`),
};
