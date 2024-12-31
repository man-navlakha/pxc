import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie'; // Import js-cookie

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [userName, setUserName] = useState(''); // To store username from cookie

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    // Retrieve the 'username' cookie value to check login status
    const storedUserName = Cookies.get('username');
    const storedToken = Cookies.get('access_token');
    console.log('Retrieved userName from cookie:', storedUserName); // Log the cookie value

    if (storedUserName && storedToken) {
      setUserName(storedUserName); // Set the username from cookie
      setIsLoggedIn(true); // Mark the user as logged in
    } else {
      setUserName('Guest'); // Default name if cookie is not found
      setIsLoggedIn(false); // Mark the user as not logged in
    }
  }, []);

  const handleLogout = () => {
    // Remove the username and access_token cookies to log the user out
    Cookies.remove('username');
    Cookies.remove('access_token');
    
    // Set the login status to false and reset the username to 'Guest'
    setIsLoggedIn(false);
    setUserName('Guest');

    // Refresh the page after logout
    window.location.reload(); // Reload the page to reset the UI and state
  };

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur transition-colors duration-500 border-b-2 bg-[#e8e8e8ba]/50 supports-backdrop-blur:bg-black/10 p-2 flex justify-between items-center">
      <div className="text-white text-5xl font-bold">
        <Link to={'/'}>
          <img
            src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png?updatedAt=1735069174018"
            alt="Company logo"
            className="h-10"
          />
        </Link>
      </div>

      <div className="flex items-center relative" onClick={toggleDropdown}>
        <img
          src="https://ik.imagekit.io/pxc/def.jpg"
          alt="Profile photo"
          className="h-10 w-10 rounded-full border-2"
        />
        {dropdownOpen && (
          <div className="absolute right-2 top-12 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
            {/* Conditionally render Profile and Logout options if logged in */}
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              // If not logged in, show Login and Signup options
              <div className="mt-4">
                <Link
                  to="/login"
                  className="text-blue-500 hover:underline block px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-blue-500 hover:underline block px-4 py-2"
                >
                  Signup
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
