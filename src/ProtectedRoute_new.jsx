import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "./utils/api";
import Loading from "./componet/Loading"; // A good loading component enhances UX

const ProtectedRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState('loading'); // Use a string state: 'loading', 'authenticated', 'unauthenticated'
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // This is the single source of truth. If the token is valid, this will succeed.
        await api.get("/me/");
        setAuthStatus('authenticated');
      } catch (error) {
        // If the token is invalid or missing, the api.js interceptor will catch
        // the 401 error and this will run.
        setAuthStatus('unauthenticated');
      }
    };

    checkAuthentication();
  }, []); // The empty array ensures this runs only once when the component first mounts.

  if (authStatus === 'loading') {
    // While checking the token, show a loading screen.
    return <Loading />;
  }

  if (authStatus === 'unauthenticated') {
    // If authentication fails, redirect to the login page.
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child component.
  return children;
};

export default ProtectedRoute;