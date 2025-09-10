import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Cookies from "js-cookie";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // 🔑 Ensure backend clears HttpOnly cookie
        await api.post("/user/logout/", {}, { withCredentials: true });
      } catch (error) {
        console.error("Logout failed on backend:", error);
      } finally {
        // 🔑 Clear any non-HttpOnly cookies stored on frontend
        Cookies.remove("username");
        Cookies.remove("profile_pic");
        Cookies.remove("access");
        Cookies.remove("refresh");

        // 🔑 Clear localStorage/sessionStorage if used
        localStorage.clear();
        sessionStorage.clear();

        // 🔑 Redirect & force reload to wipe all React states
        window.location.replace("/");
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen text-white text-xl">
      Logging out...
    </div>
  );
};

export default Logout;
