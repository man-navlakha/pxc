import React from 'react'

const Loader = () => {
  return (
    <div className="text-center p-4">
        <div className="mb-8 text-left">
            <div className="skeleton bg-gray-300 h-6 w-32 mb-2"></div>
            <div className="inline-block border-2 border-green-700 p-4 bg-white shadow-lg">
                <div className="skeleton bg-green-700 h-8 w-24"></div>
            </div>
        </div>
        <div>
            <div className="skeleton bg-gray-300 h-6 w-40 mb-4"></div>
            <div className="flex justify-start space-x-4">
                <div className="skeleton bg-green-700 h-12 w-32"></div>
                <div className="skeleton bg-green-700 h-12 w-32"></div>
            </div>
        </div>
    </div>
  )
}

export default Loader
