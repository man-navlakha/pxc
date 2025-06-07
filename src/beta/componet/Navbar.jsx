import React from 'react'

const Navbar = () => {
  return (
    <div className='top-0 z-40 sticky bg-black backdrop-blur-[10px] flex justify-between items-center px-6 py-2'>
      <div className='w-14'>
        <img src="https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png?updatedAt=1735069173555" alt="" />
      </div>

      <div>
        <a href="/beta/auth/login">
      <button className='border px-3 py-1 bg-black ease-in-out hover:shadow-[5px_5px_0px_#fff]'>
          Login/Signup
      </button>
          </a>
      </div>
    </div>
  )
}

export default Navbar
