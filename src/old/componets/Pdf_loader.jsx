import React from 'react'

const Pdf_loader = () => {
  return (
    <div>
      {[...Array(2)].map((_, index) => (
        <p key={index} className="border p-6 bg-gray-400 rounded-lg shadow-[0px_4px_0px_0px_#065f46] mb-4 p-4 w-full">
          <div className="bg-gray-400 p-4 rounded-lg mb-4 flex justify-between items-center">
            <div className="shine w-48 h-6 rounded-md"></div>
            <div className="flex space-x-4">
              <div className="shine w-24 h-6 rounded-md"></div>
              <div className="shine w-16 h-6 rounded-md"></div>
              <div className="shine w-24 h-6 rounded-md"></div>
            </div>
          </div>
        </p>
      ))}
    </div>
  )
}

export default Pdf_loader;
