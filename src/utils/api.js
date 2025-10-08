import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

let isRefreshing = false;
let refreshSubscribers = [];

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
    const isRefreshRequest = originalRequest.url.includes("/token/refresh/");

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
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
        Cookies.set("Logged", "true");
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        Cookies.set("Logged", "false");

        // --- CORRECTED REDIRECT LOGIC ---
        // Redirect to login but include the page the user was trying to access
        if (!window.location.pathname.includes("/auth/login")) {
          const intendedPath = window.location.pathname + window.location.search;
          window.location.href = `/auth/login?redirect=${encodeURIComponent(intendedPath)}`;
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;