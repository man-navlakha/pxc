import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'


const Navbar = () => {
  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur transition-colors duration-500 border-b-2 bg-[#e8e8e8ba]/50 supports-backdrop-blur:bg-black/10 p-2 flex justify-between items-center">
     
    <div className="text-white text-5xl font-bold">
     <Link to={'/'}>
        <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png?updatedAt=1735069174018" alt="Company logo" className="h-10"/>
        </Link>
    </div>
    <div className="flex items-center">
    <Link to={'/Login'}>
        <img src="https://ik.imagekit.io/pxc/def.jpg" alt="Profile photo of a person with short hair and glasses" className="h-10 w-10 rounded-full border-2"/>
        </Link>
    </div>
</nav> 
  )
}

export default Navbar
