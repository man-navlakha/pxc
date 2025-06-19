import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes, Route, Link } from 'react-router-dom'


const GoBack = () => {
  
    const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
};

  const handleGoBack = () => {
    navigate(-1); // Navigate one page back
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
  

  

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur transition-colors duration-500 border-b-2 dark:border-[#000] bg-[#e8e8e8ba]/50 dark:bg-[#434343ba]/50 supports-backdrop-blur:bg-black/10 p-2 flex justify-between items-center">
     
    <div className="flex items-center">
    <button onClick={handleGoBack} className="rounded">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 dark:text-gray-200">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
    </button>

    
     <Link to={'/'}>
        <img  src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png?updatedAt=1735069174018" alt="Company logo" className="h-10"/>
        </Link>
    </div>
  
<div className="relative">
        <div className=" px-2 py-1 rounded-lg cursor-pointer" onClick={() => toggleDropdown()} >
        {theme === "light" ? "🌞" : theme === "dark" ? "🌙" : "🖥"}
        </div>
        {dropdownOpen && (
        <div id="dropdownMenu" className="absolute right-0 mt-2 w-max bg-white-900/30 backdrop-blur-lg py-3 px-2 rounded-lg shadow-lg flex items-center flex-col space-y-2">
            {/* <button className="block w-full text-left px-4 py-2 text-gray-400 hover:bg-gray-700">System</button>
            <button className="block w-full text-left px-4 py-2 text-gray-400 hover:bg-gray-700">Dark</button>
            <button onClick={() => setTheme("light")} className={`block w-full text-left px-4 py-2 text-gray-400 hover:bg-gray-700 ${theme === "light" ? "bg-blue-400 text-white" : "bg-gray-200 dark:bg-gray-800"}`}>Light</button> */}

<button
                onClick={() => {setTheme("light");
                  setDropdownOpen(false);}}
                className={`p-2 rounded-full ${theme === "light" ? "bg-blue-400 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
              >
                ☀️ Light
              </button>
              <button
                onClick={() => {setTheme("dark");
                  setDropdownOpen(false);}}
                className={`p-2 rounded-full ${theme === "dark" ? "bg-blue-400 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
              >
                🌙 Dark
              </button>
              <button
                onClick={() => {setTheme("system");
                  setDropdownOpen(false);}}
                className={`p-2 rounded-full ${theme === "system" ? "bg-blue-400 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
              >
                🖥 System
              </button>
        </div>
        )}
    </div>
</nav> 
  );
};

export default GoBack;