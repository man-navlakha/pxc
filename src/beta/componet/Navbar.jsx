import React from 'react'

const Navbar = () => {
  return (
    <div className=' mx-5 rounded-xl top-5 w-full max-w-[1080px] z-40 sticky bg-gray-900/60 border border-gray-400/30 backdrop-blur-[10px] flex justify-between items-center px-6 py-2'>
      <div className='w-14'>
        <img src="https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png?updatedAt=1735069173555" alt="" />
      </div>

      <div>
        <a href="/beta/auth/login">
      <button className='border px-3 py-1 rounded-3xl bg-black ease-in-out hover:shadow-[2px_2px_0px_#fff]'>
          Login/Signup
      </button>
          </a>
      </div>
    </div>
  )
}

export default Navbar
