// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./utils/api"; // <-- Use your centralized API

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try refreshing the access token using HTTP-only cookie
        const hasAccessToken = Boolean(localStorage.getItem("access")); // Or from context
if (!hasAccessToken) {
   await api.post("token/refresh/", {}, { withCredentials: true });
}


        // If token refresh succeeds, verify user is authenticated
        const res = await api.get("me/");

        if (res.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Replace with spinner if desired
  }

  if (!isAuthenticated) {
    console.log("Redirecting from:", location.pathname + location.search);
    return (
      <Navigate
        to={`/auth/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
