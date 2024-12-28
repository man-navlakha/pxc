import React from 'react'
import { Document } from 'react-pdf'

const open = () => {
  return (
    <div className="">
    <h1 className="text-4xl font-bold mb-4">Python</h1>
    <div className="bg-gray-200 p-4 rounded-lg shadow-inner">
        {Array(7).fill().map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-full mb-4 shadow-md h-[4em] w-32 hover:shadow-md hover:border-emerald-500 border-emerald-800 border-2 bg-white">
                {/* <Document file="https://topperworld.in/media/2022/11/DSA-Handwritten-Notes.pdf" /> */}
                Data Structure & Algorithm
            </div>
        ))}
    </div>
</div>
  )
}

export default open
