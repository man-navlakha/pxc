import React from 'react'

const Feature = () => {
    return (
        <div className='flex flex-col justify-center content-center  items-center'>
            <div className=''>
                <div className='w-full max-w-[360px] flex my-4 items-center gap-2 text-center text-gray-100 '>
                    <span className='border-b-2 flex-1 border-gradient-l   w-14'></span>

                    <span className='font-bold'>Why Us </span>
                    <span className='border-b-2 flex-1  border-gradient  w-14'></span>
                </div>

            </div>

            <div className='flex  gap-2'>

                <marquee behavior="" direction="">
                    <div className='flex gap-2'>
                        <div className='flex items-center gap-1.5 text-sm text-gray-500 p-1 pl-2 pr-3 rounded-full bg-white bg-opacity-80 shadow backdrop-blur max-sm:hidden'>
                            Trusted by <span className='text-black'>67+</span> users.
                        </div>
                        <div className='flex items-center gap-1.5 text-sm text-gray-500 p-1 pl-2 pr-3 rounded-full bg-white bg-opacity-80 shadow backdrop-blur max-sm:hidden'>
                            Top <span className='text-black'>15+</span> subjects.
                        </div>
                        <div className='flex items-center gap-1.5 text-sm text-gray-500 p-1 pl-2 pr-3 rounded-full bg-white bg-opacity-80 shadow backdrop-blur max-sm:hidden'>
                            <span className='text-black'>AI</span> implemented.
                        </div>
                        <div className='flex items-center gap-1.5 text-sm text-gray-500 p-1 pl-2 pr-3 rounded-full bg-white bg-opacity-80 shadow backdrop-blur max-sm:hidden'>
                            Experience premium <span className='text-black'>handwritten</span> notes.
                        </div>
                    </div>
                </marquee>
                <span className='bg-linear-to-b from-violet-500 to-fuchsia-500'></span>
            </div>

        </div>
    )
}

export default Feature
