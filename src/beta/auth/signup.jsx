import React from 'react'
import '../new.css'

const signup = () => {
    return (
        <>
        <div className='geist flex flex-col'>
            
        <div>
            <div className='flex items-center flex-col justify-center py-10'>
                <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png" className='max-w-[260px] w-full h-auto ' alt="" />
            </div>
        </div>
            <div className='flex items-center flex-col justify-center p-6'>
                <div className=' px-4 py-6 flex flex-col border shadow-lg border-gray-200 max-w-[360px] w-full max-h-screen rounded-xl '>
                    <button type="button" className="w-full py-2.5 px-4 text-center justify-center flex items-center font-semibold border transition-all ease-in duration-75 whitespace-nowrap text-center select-none disabled:shadow-none disabled:opacity-50 disabled:cursor-not-allowed gap-x-1 active:shadow-none text-base leading-[22px] rounded-2xl py-2 h-10 px-6 text-gray-1k bg-gray-00 border-gray-200 dark:bg-gray-100 dark:border-gray-300 dark:hover:bg-gray-200 dark:disabled:bg-gray-00 dark:disabled:hover:bg-gray-00 shadow-5 hover:shadow-10"><svg width="20" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" className=""><g clip-path="url(#clip0_12302_63595)"><path d="M20.4893 10.1873C20.4893 9.36791 20.4213 8.76998 20.274 8.1499H10.6991V11.8482H16.3193C16.2061 12.7673 15.5942 14.1514 14.2344 15.0815L14.2153 15.2053L17.2428 17.4971L17.4525 17.5176C19.3788 15.7791 20.4893 13.2213 20.4893 10.1873Z" fill="#4285F4"></path><path d="M10.6991 19.9312C13.4526 19.9312 15.7641 19.0453 17.4525 17.5173L14.2344 15.0812C13.3733 15.6681 12.2175 16.0777 10.6991 16.0777C8.00229 16.0777 5.71339 14.3393 4.89746 11.9365L4.77786 11.9464L1.62991 14.3271L1.58875 14.439C3.26576 17.6944 6.71047 19.9312 10.6991 19.9312Z" fill="#34A853"></path><path d="M4.89735 11.9368C4.68206 11.3168 4.55747 10.6523 4.55747 9.96583C4.55747 9.27927 4.68206 8.61492 4.88603 7.99484L4.88032 7.86278L1.69292 5.44385L1.58863 5.49232C0.897454 6.84324 0.500854 8.36026 0.500854 9.96583C0.500854 11.5714 0.897454 13.0884 1.58863 14.4393L4.89735 11.9368Z" fill="#FBBC05"></path><path d="M10.6992 3.85335C12.6141 3.85335 13.9059 4.66167 14.6424 5.33716L17.5206 2.59106C15.7529 0.985494 13.4526 0 10.6992 0C6.71049 0 3.26576 2.23671 1.58875 5.49212L4.88615 7.99464C5.71341 5.59182 8.00232 3.85335 10.6992 3.85335Z" fill="#EB4335"></path></g><defs><clipPath id="clip0_12302_63595"><rect width="20" height="20" fill="white" transform="translate(0.5)"></rect></clipPath></defs></svg><span className="ml-4 text-gray-900 font-semibold text-sm">Continue with Google</span></button>

                    <div className='flex my-4 items-center gap-2 text-center text-gray-500 '>
                        <span className='border-b-2 border-gray-200 flex-1'></span>
                        <div className='text-xs'>Or use email</div>
                        <span className='border-b-2 border-gray-200 flex-1'></span>
                    </div>

                    <div>
                        <form action="" className='flex flex-col gap-3'>
                            <div className='flex flex-col gap-1'>
                                <div>

                                    <label htmlFor="email" className='text-sm font-semibold text-gray-1k'>Email</label>
                                </div>
                                <div>

                                    <input type="email" className="w-full px-2 py-1.5 outline-none text-sm rounded-lg border max-h-8 transition-all duration-100 border-gray-200 bg-gray-00 text-gray-1k hover:border-gray-300 focus-within:border-gray-300 dark:bg-gray-50 shadow-input hover:shadow-input-hover focus-within:shadow-input   " id="email" placeholder="you@youremail.com" />
                                </div>

                            </div>
                            <div className='flex flex-col gap-1'>
                                <div>

                                    <label htmlFor="password" className='text-sm font-semibold text-gray-1k'>Password</label>
                                </div>
                                <div className="relative"><input type="password" className="w-full px-2 py-1.5 outline-none text-sm rounded-lg border max-h-8 transition-all duration-100 border-gray-200 bg-gray-00 text-gray-1k hover:border-gray-300 focus-within:border-gray-300 dark:bg-gray-50 shadow-input hover:shadow-input-hover focus-within:shadow-input   " id="password" placeholder="At least 8 characters." autocomplete="off" aria-autocomplete="list" data-rr-is-password="true" /><button type="button" aria-label="view-password" className="absolute right-0 p-2 text-gray-500 cursor-pointer hover:text-gray-1k"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7c3.6 7.8 14.4 7.8 18 0m-3.22 3.982L21 15.4m-9-2.55v4.35m-5.78-6.218L3 15.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></path></svg></button></div>

                            </div>

                            <button type="submit" className="w-full mt-6 justify-center  flex items-center font-semibold border transition-all ease-in duration-75 whitespace-nowrap text-center select-none disabled:shadow-none disabled:opacity-50 text-white disabled:cursor-not-allowed gap-x-1 active:shadow-none text-base leading-[22px] rounded-2xl py-2 h-10 px-6 text-gray-00 bg-gray-900 border-gray-1k hover:bg-gray-1k disabled:bg-gray-900 dark:bg-gray-1k dark:border-gray-800 dark:hover:bg-gray-800 dark:disabled:bg-gray-800 shadow-10 hover:shadow-15 dark:shadow-10 dark:hover:shadow-10">Create Profile<span className="-mr-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19.5833M19.5833 12L12.5833 5M19.5833 12L12.5833 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></path></svg></span></button>
                        </form>
                    </div>
                    <p className="mt-2 text-gray-500 dark:text-gray-600 font-normal text-xs  text-gray-500 text-center font-normal">By clicking "Create Profile“ you agree to our <a className="text-gray-500 hover:text-gray-1k hover:underline font-semibold transition-all ease-in-out" href="https://help.peerlist.io/legal/code-of-conduct">Code of Conduct</a>, <a className="text-gray-500 hover:text-gray-1k hover:underline font-semibold transition-all ease-in-out" href="https://help.peerlist.io/legal/terms-and-conditions">Terms of Service</a> and <a className="text-gray-500 hover:text-gray-1k hover:underline font-semibold transition-all ease-in-out" href="https://help.peerlist.io/legal/privacy-policy">Privacy Policy</a>.</p>
                </div>

<p className="mt-4 text-gray-500 dark:text-gray-600 font-normal text-sm text-center">Already have a profile? <a className="text-gray-500 hover:text-gray-1k hover:underline font-semibold transition-all ease-in-out" href="/beta/auth/login">Log in</a></p>
            </div>



            
        </div>
        </>
    )
}

export default signup
