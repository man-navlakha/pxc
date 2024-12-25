import React from 'react'

const Navbar = () => {
  return (
    <nav className="sticky top-0 bg-gray-200 p-3 flex justify-between items-center">
    <div className="text-white text-5xl font-bold">
      <a href="http://192.168.43.61:5173" target="_blank" rel="noopener noreferrer">
        <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png?updatedAt=1735069174018" alt="Company logo with a stylized letter 'A' in blue and white" className="h-10"/>
        </a>
    </div>
    <div className="flex items-center">
        <img src="https://ik.imagekit.io/pxc/def.jpg" alt="Profile photo of a person with short hair and glasses" className="h-10 w-10 rounded-full"/>
    </div>
</nav>
  )
}

export default Navbar
