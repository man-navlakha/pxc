import React from 'react'
import java from '../assets/img/java.png'
import ios from '../assets/img/ios.png'

const Exam = () => {
  return (
    <div className='flex flex-col md:flex-row  gap-4'>
          {/* <div className="rounded-xl div f-black shadow-[4px_5px_0px_0px_#065f46] hover:scale-110 h-[4em] w-32 hover:shadow-md hover:border-emerald-500 border-emerald-800 border-2 bg-white m-auto overflow-hidden relative group p-2 z-0">
      <img src={java} className="circle absolute h-[5em] scale-[50%] top-0 -right-[0.5em]  group-hover:scale-[200%] duration-500 z-[-1] op" />

      <h1 className="z-20 text-green-900 font-bold font-Poppin group-hover:text-emerald-950 duration-500 text-[1.4em]">
       Java
      </h1>
    </div> */}

    <a href="/choose?course=B.C.A&sub=Introduction%20to%20Core%20Java%20(ICJ)">

          <div className="group w-full flex flex-col items-center space-y-4 rounded-2xl border border-gray-200 p-6 hover:shadow-lg dark:hover:shadow-xl shadow-emerald-600 transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-red-600"
   >
      <img src={java}  className="w-24 h-24 object-contain"/>

      <h1 className="text-lg font-semibold text-black dark:text-white group-hover:text-red-600">
       Java
      </h1>
    </div>
       </a>
    <a href="/choose?course=B.C.A&sub=Introduction%20to%20Operating%20System%20(IOS)">

          <div className="group flex flex-col items-center space-y-4 rounded-2xl border border-gray-200 p-6 hover:shadow-lg dark:hover:shadow-xl shadow-emerald-600 transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-red-600"
   >
      <img src={ios}  className="w-24 h-24 object-contain"/>

      <h1 className="text-lg font-semibold text-black dark:text-white group-hover:text-red-600">
       IOS
      </h1>
    </div>
       </a>
    </div>
  )
}

export default Exam
