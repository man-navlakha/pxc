import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const token = Cookies.get('access_token');


  const keroopen = () => {
    if (open === true) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  return (
    <>
    <div className="  sticky top-5 z-40">

      <div className='flex-row mx-5 rounded-xl top-5  z-40 sticky  border border-gray-400/30 bg-gray-900
bg-clip-padding
backdrop-filter
backdrop-blur-xl
bg-opacity-10
backdrop-saturate-100
backdrop-contrast-100 flex justify-between items-center px-6 py-2'>
  <a href="/">

        <div className='w-14'>
          <img src="https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png?updatedAt=1735069173555" alt="" />
        </div>
  </a>
        {token ?
<>
<div className={`block md:block lg:hidden `}  >


            <label className="flex flex-col gap-2 w-8">
              <input className="peer hidden" type="checkbox" onClick={keroopen} />
              <div
                className="rounded-2xl h-[3px] w-1/2 bg-white duration-500 peer-checked:rotate-[225deg] origin-right peer-checked:-translate-x-[12px] peer-checked:-translate-y-[1px]"
                ></div>
              <div
                className="rounded-2xl h-[3px] w-full bg-white duration-500 peer-checked:-rotate-45"
                ></div>
              <div
                className="rounded-2xl h-[3px] w-1/2 bg-white duration-500 place-self-end peer-checked:rotate-[225deg] origin-left peer-checked:translate-x-[12px] peer-checked:translate-y-[1px]"
                ></div>
            </label>
          </div>
<div className={`hidden md:hidden lg:block `} >
  
          <div className="flex gap-4 items-center justify-center text-white font-medium ">
             <a href="/profile">
            <span className="hover:text-gray-400">Profile</span>
              </a>
             <a href="/Logout">
            <span className="hover:text-red-600">Logout</span>
              </a>
            
                      </div>
</div>
                </>

:
          <div>
            <a href=" /auth/login">
              <button className='border text-white px-3 py-1 rounded-3xl bg-black ease-in-out hover:shadow-[2px_2px_0px_#fff]'>
                Login/Signup
              </button>
            </a>
          </div>

}

      </div>

        <div className="">
          <div className={`${open ? 'block' : 'hidden'} mx-5 my-2 mt-5 rounded-xl z-40 border border-gray-400/30 bg-gray-900/60 text-white backdrop-blur-[10px] px-6 py-2`}>
            <ul className='list-none w-full text-center'>
              <a href=" /profile">
                <li className='py-2 text-left px-3 m-2 border-b w-full '>Profile 👉</li>
              </a>
              <a href="/logout">
                <li className='py-2 text-left px-3 m-2 border-b w-full '>LogOut ⭕</li>
              </a>
              <li className='font-bold text-white/20'>Made with 🩷</li>
            </ul>
          </div>
        </div>
</div>
    </>
  )
}

export default Navbar
