import React from 'react'
import { useNavigate, useLocation, Link } from "react-router-dom";
import Top from './Top-H'

const View = () => {
  
      const navigate = useNavigate();
      const location = useLocation();

      const handleflow = () =>{
        navigate("/beta/sem");
      }
  return (
    <div className='p-4 flex flex-col text-center content-center flex-nowrap jusify-center gap-3 items-center '>
      <Top />
      <div>
        <span className='text-center m-3 text-3xl md:text-lg lg:text-3xl font-black bg-clip-text bg-gradient-to-br from-white to-zinc-500 text-transparent Mont '>Access Top-Quality PDF Notes Instantly!!</span>
      </div>
      {/* <div>
        <span className='text-center text-md my-3 font-medium'>Experience premium handwritten notes! 🚀</span>
      </div> */}

      <div className='flex gap-3 mt-5' >

        <div  onClick={() => handleflow()} className="flex items-center justify-center">
          <div className="relative group">
            <button 
              className="relative inline-block p-px font-semibold leading-6 text-zinc-400\80 bg-gray-800 shadow cursor-pointer shadow-zinc-900 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
            >
              <span
                className="absolute inset-0  bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              ></span>

              <span className="relative z-0 block px-6 py-3  bg-gray-950">
                <div className="relative z-10 flex items-center space-x-2">
                  <span className="transition-all duration-500 group-hover:translate-x-1"
                  >Browse all resources</span>
                  <svg
                    className="w-6 h-6 transition-transform duration-500 group-hover:translate-x-1"
                    data-slot="icon"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clip-rule="evenodd"
                      d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                      fill-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              </span>
            </button>
          </div>
        </div>


      </div>
      {/* <Search /> */}

    </div>
  )
}

export default View
