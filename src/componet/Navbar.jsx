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
          <svg
            width="64px"
            height="64px"
            viewBox="-12 -12 48.00 48.00"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            fill="#000000"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth={0} />
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g id="SVGRepo_iconCarrier">
              <defs>
                <rect id="home-a" width={2} height={6} />
                <path
                  id="home-c"
                  d="M14,19 L17,19 L17,11 C17,10.4477153 17.4477153,10 18,10 L18.5857864,10 L11,2.41421356 L3.41421356,10 L4,10 C4.55228475,10 5,10.4477153 5,11 L5,19 L8,19 L8,13 C8,11.8954305 8.8954305,11 10,11 L12,11 C13.1045695,11 14,11.8954305 14,13 L14,19 Z M3.00145774,12 L1.00182217,12 C0.11107966,12 -0.335005833,10.9228581 0.294844238,10.2928932 L10.2930221,0.292893219 C10.6834752,-0.0976310729 11.3165248,-0.0976310729 11.7069779,0.292893219 L21.7051558,10.2928932 C22.3350058,10.9228581 21.8889203,12 20.9981778,12 L18.9985423,12 L18.9985423,20 C18.9985423,20.5522847 18.5509086,21 17.9987245,21 L4.00127552,21 C3.44909141,21 3.00145774,20.5522847 3.00145774,20 L3.00145774,12 Z M10,13 L10,19 L12,19 L12,13 L10,13 Z"
                />
              </defs>
              <g fill="none" fillRule="evenodd">
                <g transform="translate(11 14)">
                  <mask id="home-b" fill="#ffffff">
                    <use xlinkHref="#home-a" />
                  </mask>
                  <use fill="#D8D8D8" xlinkHref="#home-a" />
                  <g fill="#FFA0A0" mask="url(#home-b)">
                    <rect width={24} height={24} transform="translate(-11 -14)" />
                  </g>
                </g>
                <g transform="translate(1 1)">
                  <mask id="home-d" fill="#ffffff">
                    <use xlinkHref="#home-c" />
                  </mask>
                  <use fill="#000000" fillRule="nonzero" xlinkHref="#home-c" />
                  <g fill="#7600FF" mask="url(#home-d)">
                    <rect width={24} height={24} transform="translate(-1 -1)" />
                  </g>
                </g>
              </g>
            </g>
          </svg>
          <span className="text-xs">Home</span>
        </a>
        <a href="/search" className="flex flex-col items-center text-white hover:text-blue-400">
          <svg
            width="64px"
            height="64px"
            viewBox="-12.24 -12.24 48.48 48.48"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            fill="#000000"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth={0} />
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g id="SVGRepo_iconCarrier">
              <defs>
                <path
                  id="search-a"
                  d="M11.7099609,0.572509766 C9.46940104,1.29012044 7.99951172,3.05419922 7.30029297,5.86474609 C6.25146484,10.0805664 4.95166016,10.6181641 0.719970703,9.11865234 C2.23974609,11.9257813 5.32006836,13.0512695 7.30029297,13.0512695 C9.28051758,13.0512695 14.4091797,10.2941895 13.8215332,5.0534668 C13.3114421,3.52709961 12.6075846,2.03344727 11.7099609,0.572509766 Z"
                />
                <path
                  id="search-c"
                  d="M14.1791377,12.7701494 L19.7100661,18.3101411 C20.0966446,18.6967197 20.0966446,19.3234875 19.7100661,19.7100661 C19.3234875,20.0966446 18.6967197,20.0966446 18.3101411,19.7100661 L12.7803471,14.1712106 C11.4385246,15.2160226 9.75152329,15.8383427 7.91917136,15.8383427 C3.54553379,15.8383427 0,12.2928089 0,7.91917136 C0,3.54553379 3.54553379,0 7.91917136,0 C12.2928089,0 15.8383427,3.54553379 15.8383427,7.91917136 C15.8383427,9.74688445 15.2191696,11.4299819 14.1791377,12.7701494 Z M7.91917136,13.8585499 C11.1993995,13.8585499 13.8585499,11.1993995 13.8585499,7.91917136 C13.8585499,4.63894318 11.1993995,1.97979284 7.91917136,1.97979284 C4.63894318,1.97979284 1.97979284,4.63894318 1.97979284,7.91917136 C1.97979284,11.1993995 4.63894318,13.8585499 7.91917136,13.8585499 Z"
                />
              </defs>
              <g fill="none" fillRule="evenodd" transform="translate(2 2)">
                <g transform="translate(1 2)">
                  <mask id="search-b" fill="#ffffff">
                    <use xlinkHref="#search-a" />
                  </mask>
                  <use fill="#D8D8D8" xlinkHref="#search-a" />
                  <g fill="#FFA0A0" mask="url(#search-b)">
                    <rect width={24} height={24} transform="translate(-3 -4)" />
                  </g>
                </g>
                <mask id="search-d" fill="#ffffff">
                  <use xlinkHref="#search-c" />
                </mask>
                <use fill="#000000" fillRule="nonzero" xlinkHref="#search-c" />
                <g fill="#7600FF" mask="url(#search-d)">
                  <rect width={24} height={24} transform="translate(-2 -2)" />
                </g>
              </g>
            </g>
          </svg>
          <span className="text-xs">Search</span>
        </a>
        <a href="/profile" className="flex flex-col items-center text-white hover:text-blue-400">
           <img className="w-16 h-16 rounded-full border-4 border-white/30 shadow-lg object-cover"
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
