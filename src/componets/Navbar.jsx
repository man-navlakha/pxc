import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie'; // Import js-cookie

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [userName, setUserName] = useState(''); // To store username from cookie
    const navigate = useNavigate();
    const toggleDropdown = () => {
      setDropdownOpen(!dropdownOpen);
  };
    const [theme, setTheme] = useState(() => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("theme") || "system"; // Default to system preference
      }
      return "system";
    });
  
    useEffect(() => {
      const applyTheme = (selectedTheme) => {
        if (selectedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      };
  
      if (theme === "system") {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(systemPrefersDark ? "dark" : "light");
      } else {
        applyTheme(theme);
      }
  
      localStorage.setItem("theme", theme);
    }, [theme]);

    
  const clickprofile = () => {
    navigate('/profile'); // Navigate one page back
  };

  const handleLoginClick = () => {
    navigate('/Login');
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
    <nav className="sticky top-0 z-40 w-full backdrop-blur transition-colors duration-500 border-b-2 dark:border-[#000] bg-[#e8e8e8ba]/50 dark:bg-[#434343ba]/50 supports-backdrop-blur:bg-black/10 p-2 flex justify-between items-center">
      <div className="text-white text-5xl font-bold">
        <Link to={'/'}>
          <img
            src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png?updatedAt=1735069174018"
            alt="Company logo"
            className="h-10 "
          />
        </Link>
      </div>
      
      

      <div className="flex items-center relative">
      {isLoggedIn ? (
        <>
        <img
        onClick={clickprofile}
        src="https://ik.imagekit.io/pxc/def.jpg"
        alt="Profile photo"
        className="h-10 w-10 rounded-full border-2 bg-traparent"
        />

        
        </>
      ) : (
        <div className='flex items-center space-x-2'>
        <div onClick={handleLoginClick} className='text-white f-black text-lg bg-[#0f6c38] dark:bg-[#1e1e1e] px-2 py-1 rounded-md cursor-pointer'>

        Join Now
        </div>
       
                {/* <div className="flex items-center space-x-2">
              <button
                onClick={() => setTheme("light")}
                className={`p-2 rounded-full ${theme === "light" ? "bg-blue-400 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
              >
                ☀️ Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-2 rounded-full ${theme === "dark" ? "bg-blue-400 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
              >
                🌙 Dark
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`p-2 rounded-full ${theme === "system" ? "bg-blue-400 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
              >
                🖥 System
              </button>
            </div> */}
        </div>
                )}

<div className="relative">
        <div className=" px-2 py-1 rounded-lg cursor-pointer" onClick={() => toggleDropdown()} >
            <i className="fas fa-laptop text-gray-400 text-lg"></i>
        </div>
        {dropdownOpen && (
        <div id="dropdownMenu" className="absolute right-0 mt-2 w-max bg-gray-900 py-3 px-2 rounded-lg shadow-lg flex items-center flex-col space-y-2">
            {/* <button className="block w-full text-left px-4 py-2 text-gray-400 hover:bg-gray-700">System</button>
            <button className="block w-full text-left px-4 py-2 text-gray-400 hover:bg-gray-700">Dark</button>
            <button onClick={() => setTheme("light")} className={`block w-full text-left px-4 py-2 text-gray-400 hover:bg-gray-700 ${theme === "light" ? "bg-blue-400 text-white" : "bg-gray-200 dark:bg-gray-800"}`}>Light</button> */}

<button
                onClick={() => setTheme("light")}
                className={`p-2 rounded-full ${theme === "light" ? "bg-blue-400 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
              >
                ☀️ Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-2 rounded-full ${theme === "dark" ? "bg-blue-400 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
              >
                🌙 Dark
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`p-2 rounded-full ${theme === "system" ? "bg-blue-400 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
              >
                🖥 System
              </button>
        </div>
        )}
    </div>
      </div>

      
    </nav>
  );
};

export default Navbar;
