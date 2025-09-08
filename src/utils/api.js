import axios from "axios";

const api = axios.create({
  baseURL: "https://pixel-classes.onrender.com/api",
  withCredentials: true, // send cookies
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If refresh endpoint itself fails → logout directly
    if (originalRequest.url.includes("/token/refresh/")) {
      console.error("Refresh token invalid or expired");
      window.location.href = "/auth/login";
      return Promise.reject(error);
    }

    // If 401 and request has not been retried yet → try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post("/token/refresh/"); // backend sets new access cookie
        return api(originalRequest);       // retry original request
      } catch (refreshError) {
        console.error("Session expired. Redirecting to login...");
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
