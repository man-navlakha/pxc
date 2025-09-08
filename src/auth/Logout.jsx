import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Cookies from 'js-cookie';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call the backend to clear HttpOnly cookies
        await api.post('/user/logout/');
      } catch (error) {
        console.error("Logout failed on backend:", error);
      } finally {
        // Clear any remaining frontend cookies
        Cookies.remove('username');
        Cookies.remove('profile_pic');
        
        // Redirect to home page and force a full refresh to clear all states
        window.location.href = '/';
      }
    };

    performLogout();
  }, []);

  return <div>Logging out...</div>;
};

export default Logout;