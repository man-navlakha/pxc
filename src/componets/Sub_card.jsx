import React from 'react'

const Sub_card = ({ subject, onClick }) => {
  return (
    <div onClick={(event) => onClick(event, subject.id)}>
       <div className="flex items-center bg-emerald-600 border-emerald-800 border-2 border-dashed mb-2 mr-4 wrap-text  text-gray-800 shadow-[4px_5px_0px_0px_#065f46] hover:shadow-[2px_2px_0px_0px_#065f46]">
            <i className="fas fa-drafting-compass text-2xl"></i>
            <span className="break-all ml-2 text-xl font-bold w-screen h-full p-4">
                <span>{subject.name}</span>
            </span>
        </div>
    </div>
  )
}

export default Sub_card