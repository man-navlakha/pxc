import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "./utils/api"; // Make sure this path is correct

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // This endpoint should be protected and return user data if the cookie is valid
        await api.get("/me/");
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);

  if (isAuthenticated === null) {
    // You can return a loading spinner here for a better user experience
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children;
};

export default ProtectedRoute;