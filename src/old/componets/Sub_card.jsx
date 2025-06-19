import React from 'react'

const Sub_card = ({ subject, onClick }) => {
  return (
    <div onClick={(event) => onClick(event, subject.id)}>
       <div className="flex items-center content-center text-center hover:border-[#065f46] w-man h-[100px] p-2 border bg-white dark:bg-[#383838] rounded-lg shadow-[0px_4px_0px_0px_#065f46] hover:shadow-[2px_2px_0px_0px_#065f46] cursor-pointer">
            <span className="break-all ml-2 text-xl font-bold h-full p-4">
            <i className="fas fa-book-open text-2xl pr-3"></i>
                <span>{subject.name}</span>
            </span>
        </div>
    </div>
  )
}

export default Sub_card