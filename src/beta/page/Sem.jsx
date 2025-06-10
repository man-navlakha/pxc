import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import '../new.css'
import Footer from '../componet/Footer'
import Navbar from '../componet/Navbar'

const Semester = () => {
    const Semesters = ["Semester 3", "Semester 4", "Semester 5", "Semester 6"];
    const [letest, setLetest] = useState(Cookies.get("latest_sem") || null);

   const handleSem = (sem) =>{
      Cookies.set("latest_sem", sem);
    setLetest(sem);
   }


    return (
        <>
         <div className="bg-pattern "></div>
            <div className='mesh_sem Mont h-screen'>
                <Navbar />
                <div className=' mont'>
                    <div className='p-4 py-16 flex flex-col text-center content-center flex-nowrap jusify-center gap-3 items-center '>
                        <div>
                            <span className='text-center m-3 text-3xl md:text-lg lg:text-3xl font-black bg-clip-text bg-gradient-to-tr from-slate-100 to-stone-500 text-transparent Mont '>Ready to Conquer Your BCA Semesterester?</span>
                        </div>
                        <div>
                            <span className='text-center text-md my-3 text-gray-300 font-medium'>Tap your Semesterester to unlock all essential study materials.🚀</span>
                        </div>
                    </div>


                </div>
                <div className='mesh_sem2 h-full p-5'>
                    <div className='grid gap-4 text-white items-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-flow-cols'>
                        {Semesters.map((sem, index) => (
                            <div
                                key={index}
                                 onClick={() => handleSem(sem)}
                                className={`flex-1 flex max-w-[100vw] py-6 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-r from-[#0f172a]/10 to-[#334155]/10 bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-10 backdrop-saturate-100 backdrop-contrast-100 [box-shadow:5px_5px_1px_0px_#d4d4d405,_0px_28px_108px_rgba(13,34,71,0.1),inset_0px_-1px_1px_rgba(13,34,71,0.12)] lg:min-w-[384px]`}>
                                <div className='text-xl font-bold flex items-center justify-center'>
                                    <span className="mr-1">{sem}</span> <span className={` ${letest == sem ? 'visible' : 'hidden' } border-green-600 bg-green-600/30 p-1 rounded text-xs`}>Last Used</span>
                                </div>
                            </div>
                        ))}




                    </div>
                </div>
                <Footer />
            </div>
        </>
    )
}

export default Semester
