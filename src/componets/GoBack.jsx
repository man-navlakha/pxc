import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes, Route, Link } from 'react-router-dom'


const GoBack = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Navigate one page back
  };

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur transition-colors duration-500 border-b-2 dark:border-[#000] bg-[#e8e8e8ba]/50 dark:bg-[#434343ba]/50 supports-backdrop-blur:bg-black/10 p-2 flex justify-between items-center">
     
    <div className="flex items-center">
    <button onClick={handleGoBack} className="rounded">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 dark:text-gray-900">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
    </button>

    
     <Link to={'/'}>
        <img  src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png?updatedAt=1735069174018" alt="Company logo" className="h-10"/>
        </Link>
    </div>
  
</nav> 
  );
};

export default GoBack;