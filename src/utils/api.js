import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

// Flag to avoid infinite loops
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push(() => resolve(api(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post("/api/token/refresh/", {}, { withCredentials: true });

        isRefreshing = false;
        onRefreshed();

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
