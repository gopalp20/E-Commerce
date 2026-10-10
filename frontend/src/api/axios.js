import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach Authorization token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for handling 401s or network errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Extract server error message from backend if available
    const backendMessage =
      error.response?.data?.details?.[0]?.message ||
      error.response?.data?.message;
    if (backendMessage) {
      error.message = backendMessage;
    }

    if (error.response && error.response.status === 401) {
      // Clear token only if we were actually authenticated and not on login/register
      const url = error.config?.url || "";
      if (
        !url.includes("/auth/login") &&
        !url.includes("/auth/register") &&
        error.config?.headers?.Authorization ===
          `Bearer ${localStorage.getItem("token")}`
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("forme:session-expired"));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
