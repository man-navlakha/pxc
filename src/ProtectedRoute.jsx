import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = Cookies.get("access_token"); // ✅ Check if user is logged in
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/old/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}  replace />;
  }

  return children;
};

export default ProtectedRoute;
