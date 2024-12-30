import React, { useState }  from 'react'
import { Routes, Route, Link } from 'react-router-dom'


const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur transition-colors duration-500 border-b-2 bg-[#e8e8e8ba]/50 supports-backdrop-blur:bg-black/10 p-2 flex justify-between items-center">
     
    <div className="text-white text-5xl font-bold">
     <Link to={'/'}>
        <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png?updatedAt=1735069174018" alt="Company logo" className="h-10"/>
        </Link>
    </div>
    <div className="flex items-center" onClick={toggleDropdown}>
   
        <img src="https://ik.imagekit.io/pxc/def.jpg" alt="Profile photo of a person with short hair and glasses" className="h-10 w-10 rounded-full border-2"/>
        {dropdownOpen && (
            <div className="absolute right-2 top-12 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
              <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile</Link>
              <Link to="/login" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Login</Link>
              <Link to="/signup" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Signup</Link>
              <Link to="/logout" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Logout</Link>
            </div>
          )}
    </div>
    {/* <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-lg font-bold">Home</Link>
        <div className="relative">
          <div className="flex items-center" onClick={toggleDropdown}>
            <img src="https://ik.imagekit.io/pxc/def.jpg" alt="Profile photo of a person with short hair and glasses" className="h-10 w-10 rounded-full border-2 cursor-pointer" />
          </div>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
              <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile</Link>
              <Link to="/login" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Login</Link>
              <Link to="/signup" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Signup</Link>
              <Link to="/logout" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Logout</Link>
            </div>
          )}
        </div>
      </div> */}
</nav> 
  )
}

export default Navbar
