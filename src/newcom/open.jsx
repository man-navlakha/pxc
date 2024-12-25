import React from 'react'

const open = () => {
  return (
    <div className="">
    <h1 className="text-4xl font-bold mb-4">Python</h1>
    <div className="bg-gray-200 p-4 rounded-lg shadow-inner">
        {Array(7).fill().map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-full mb-4 shadow-md">
                Data Structure & Algorithm
            </div>
        ))}
    </div>
</div>
  )
}

export default open
