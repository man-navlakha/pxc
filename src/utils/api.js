import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

// Flags to avoid loops
let isRefreshing = false;
let refreshSubscribers = [];

// Retry queued requests after refresh
function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop if refresh request itself fails
    const isRefreshRequest = originalRequest.url.includes("/token/refresh/");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(api(originalRequest)));
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

        // Redirect only if not already on login page
        if (!window.location.pathname.includes("/auth/login")) {
          window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
