import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove the access_token from cookies
    Cookies.remove('access_token');
    Cookies.remove('username');
        Cookies.remove('access_token');
        
        // Set the login status to false and reset the username to 'Guest'
        setIsLoggedIn(false);
        setUserName('Guest');
    

    // Redirect to the login page
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 w-full max-w-sm">
        <h1 className="text-2xl font-ff font-bold">Logging out...</h1>
      </div>
    </div>
  );
};

export default Logout;