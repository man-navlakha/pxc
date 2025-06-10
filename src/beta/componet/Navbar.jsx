import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const token = Cookies.get('access_token');

 
  const keroopen = () => {
    if (open === true){
      setOpen(false);
    }else{
      setOpen(true);
    }
  };
  useEffect(() => {
  console.log(open);
}, [open]);

  return (
    <>
    <div className=' mx-5 rounded-xl top-5  z-40 sticky  border border-gray-400/30 bg-gray-900
bg-clip-padding
backdrop-filter
backdrop-blur-xl
bg-opacity-10
backdrop-saturate-100
backdrop-contrast-100 flex justify-between items-center px-6 py-2'>
      <div className='w-14'>
        <img src="https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png?updatedAt=1735069173555" alt="" />
      </div>
{token ?

<div  >


<label className="flex flex-col gap-2 w-8">
  <input className="peer hidden" type="checkbox"  onClick={keroopen}/>
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
:  <div>
        <a href="/beta/auth/login">
          <button className='border text-white px-3 py-1 rounded-3xl bg-black ease-in-out hover:shadow-[2px_2px_0px_#fff]'>
            Login/Signup
          </button>
        </a>
      </div>

}
     

    </div>
<div className="">
  <div className={`${open ? 'block' : 'hidden'} absolute mx-5 my-2 mt-5 rounded-xl z-40 border border-gray-400/30 bg-green-900/60 backdrop-blur-[10px] px-6 py-2`}>
    <ul className='list-none w-full text-center'>
      <a href="/profile">
        <li className='py-2 text-left px-3 hover:border hover:shadow-[2px_2px_0px_#fff] m-2 border-b w-full '>Profile 👉</li>
      </a>
      <a href="/logout">
        <li className='py-2 text-left px-3 hover:border hover:shadow-[2px_2px_0px_#fff] m-2 border-b w-full '>LogOut ⭕</li>
      </a>
      <li className='font-bold text-white/20'>Made with 🩷</li>
    </ul>
  </div>
</div>
    </>
  )
}

export default Navbar
