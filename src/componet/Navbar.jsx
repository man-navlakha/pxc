import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const token = Cookies.get('access_token');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50); // adjust threshold as needed
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const keroopen = () => {
    if (open === true) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <div
        className={`transition-all duration-500 ease-in-out ${!scrolled ? 'top-5 sticky rounded-xl' : 'top-0 mx-0 rounded-none sticky'
          } z-40`}
      >
        <div
          className={`transition-all duration-500 ease-in-out ${!scrolled
            ? 'mx-5 top-5 sticky rounded-xl border border-gray-400/30'
            : 'top-0 mx-0 rounded-none'
            } flex-row z-40 border-b border-gray-400/30 bg-gray-900
    bg-clip-padding
    backdrop-filter
    backdrop-blur-xl
    bg-opacity-10
    backdrop-saturate-100
    backdrop-contrast-100 flex justify-between items-center px-6 py-2`}
        >
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
                  <a href="/search">
                    <span className="hover:text-blue-400">Find a friend</span>
                  </a>
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

                <button
                  className="group/button relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gray-900
    bg-clip-padding
    backdrop-filter
    backdrop-blur-xl
    bg-opacity-10
    backdrop-saturate-100
    backdrop-contrast-100  px-6 py-2 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:scale-110 border border-white/20"
                >
                  <span className="text-md">Login</span>
                  <div
                    className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]"
                  >
                    <div className="relative h-full w-10 bg-white/20"></div>
                  </div>
                </button>

              </a>

            </div>

          }

        </div>

        <div className="">
          <div className={`${open ? 'block' : 'hidden'} mx-5 my-2 mt-5 rounded-xl z-40 border border-gray-400/30 bg-gray-900/60 text-white backdrop-blur-[10px] px-6 py-2`}>
            <ul className='list-none w-full text-center'>
              <a href=" /search">
                <li className='py-2 text-left px-3 m-2 border-b w-full '>Find a friend 🔍</li>
              </a>
              <a href=" /profile">
                <li className='py-2 text-left px-3 m-2 border-b w-full '>Profile 👉</li>
              </a>
              <a href="/logout">
                <li className='py-2 text-left px-3 m-2  w-full '>LogOut ⭕</li>
              </a>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Navbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-400/30 bg-gray-900
    bg-clip-padding
    backdrop-filter
    backdrop-blur-2xl
    bg-opacity-10
    backdrop-saturate-100
    backdrop-contrast-100 flex justify-around items-center py-2 md:hidden">
        <a href="/" className="flex flex-col items-center text-white hover:text-blue-400">
        <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.1" d="M17.7218 8.08382L14.7218 5.29811C13.4309 4.09937 12.7854 3.5 12 3.5C11.2146 3.5 10.5691 4.09937 9.2782 5.29811L6.2782 8.08382C5.64836 8.66867 5.33345 8.96109 5.16672 9.34342C5 9.72575 5 10.1555 5 11.015V16.9999C5 18.8856 5 19.8284 5.58579 20.4142C6.17157 20.9999 7.11438 20.9999 9 20.9999H9.75V16.9999C9.75 15.7573 10.7574 14.7499 12 14.7499C13.2426 14.7499 14.25 15.7573 14.25 16.9999V20.9999H15C16.8856 20.9999 17.8284 20.9999 18.4142 20.4142C19 19.8284 19 18.8856 19 16.9999L19 11.015C19 10.1555 19 9.72575 18.8333 9.34342C18.6666 8.96109 18.3516 8.66866 17.7218 8.08382Z" fill="#fff"></path> <path d="M19 9L19 17C19 18.8856 19 19.8284 18.4142 20.4142C17.8284 21 16.8856 21 15 21L14 21L10 21L9 21C7.11438 21 6.17157 21 5.58579 20.4142C5 19.8284 5 18.8856 5 17L5 9" stroke="#fff" stroke-width="2" stroke-linejoin="round"></path> <path d="M3 11L7.5 7L10.6713 4.18109C11.429 3.50752 12.571 3.50752 13.3287 4.18109L16.5 7L21 11" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10 21V17C10 15.8954 10.8954 15 12 15V15C13.1046 15 14 15.8954 14 17V21" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
          <span className="text-xs">Home</span>
        </a>
        <a href="/search" className="flex flex-col items-center text-white hover:text-blue-400">
        <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.1" d="M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" fill="#fff"></path> <path d="M17 17L21 21" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#fff" stroke-width="2"></path> </g></svg>
          <span className="text-xs">Search</span>
        </a>
        <a href="/profile" className="flex flex-col items-center text-white hover:text-blue-400">
           <img className="w-12 h-12 rounded-full border-4 border-white/30 shadow-lg object-cover"
                         src={Cookies.get("profile_pic")}
                        alt="Profile"
                      />
          <span className="text-xs">Profile</span>
        </a>
      </div>

    </>
  )
}

export default Navbar
