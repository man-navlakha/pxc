// api.js
import axios from "axios";

// --- Axios instance ---
const api = axios.create({
  baseURL: "https://pixel-classes.onrender.com/api",
  withCredentials: true, // send cookies automatically
});

// --- Helper to read cookies ---
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// --- Request interceptor: attach Authorization header ---
api.interceptors.request.use(
  (config) => {
    const token = getCookie("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor: handle 401 and refresh token ---
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not retried yet → try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // queue the request until refresh is done
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = "Bearer " + token;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Hit refresh endpoint (cookies handle refresh token)
        // ✅ Ensure path matches backend
await api.post("/token/refresh/");


        const newAccess = getCookie("access");
        processQueue(null, newAccess);

        if (newAccess) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        }
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // If refresh failed → force logout
        console.error("[api] Token refresh failed. Logging out.");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
