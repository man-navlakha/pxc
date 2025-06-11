import React from 'react'
import '../../new.css';
import Cookies from "js-cookie";
import Navbar from '../../componet/Navbar';
import Footer from '../../componet/Footer';

const Ns = () => {
    const sem = Cookies.get("latest_sem");
    const Subject = Cookies.get("sub");
    const choose = Cookies.get("choose");
    return (
        <>
            <div className='mesh_ns h-screen overflow-y-scroll '>
                <Navbar />
                <div className='mont'>
                    <div className='p-4 py-16 flex flex-col text-center content-center flex-nowrap justify-center gap-3 items-center'>
                        <div>
                            <span className='text-center m-3 text-3xl md:text-lg lg:text-3xl font-black bg-clip-text bg-gradient-to-tr from-slate-100 to-stone-500 text-transparent Mont '>Dowmload Free {choose}?</span>
                        </div>
                        <div>
                            <span className='text-center text-md my-3 text-gray-300 font-medium'>for {Subject},({sem})</span>
                        </div>
                    </div>
                </div>


                <div className='flex flex-col p-6 '>
                    <div className='flex max-w-[100vw]  p-4  flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/50 bg-gray-100 bg-clip-padding backdrop-filter backdrop-blur bg-opacity-10 backdrop-saturate-100 backdrop-contrast-100 [box-shadow:0px_1px_8px_rgba(13,34,71,0.12),_0px_28px_108px_rgba(13,34,71,0.1),inset_0px_-1px_1px_rgba(13,34,71,0.12)] lg:min-w-[384px] '>

                    </div>
                </div>

            </div>
            <Footer />
        </>
    )
}

export default Ns
