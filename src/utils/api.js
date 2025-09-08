// api.js
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "https://pixel-classes.onrender.com/api",
  withCredentials: true, // send cookies (access, refresh, csrftoken)
});

// --- Request interceptor: add Authorization header from cookie ---
api.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("access");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor: handle 401 by refreshing token ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only try refresh once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call backend refresh endpoint
        const refreshResponse = await axios.post(
          "https://pixel-classes.onrender.com/api/token/refresh/",
          {},
          { withCredentials: true }
        );

        // New access token is already set in cookie by backend
        // Update header and retry original request
        const newAccessToken = Cookies.get("access");
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest); // retry original request
      } catch (refreshError) {
        // Refresh failed → user needs to login
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
