import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Logout = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [userName, setUserName] = useState(''); // To store username from cookie

  useEffect(() => {
    // Remove the access_token from cookies
    Cookies.remove('access_token');
    Cookies.remove('username');
        Cookies.remove('access_token');
        
        // Set the login status to false and reset the username to 'Guest'
        setIsLoggedIn(false);
        setUserName('Guest');
    

    // Redirect to the login page
    navigate('/auth/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:text-gray-100 dark:bg-[#1e1e1e]">
      <div className="p-6 w-full max-w-sm">
        <h1 className="text-2xl title-home-home font-bold">Logging out...</h1>
      </div>
    </div>
  );
};

export default Logout;