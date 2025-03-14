import React from 'react'

const Cbtn = (props) => {
  return (
    <div className='hover:f-black '>
      <button className="py-4 w-full border-4 f-black  hover:bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-lime-600  to-emerald-100 border-emerald-600 shadow-[4px_5px_0px_0px_#065f46] hover:shadow-[2px_2px_0px_0px_#065f46] bg-[#0f6c38] hover:border-4 hover:border-transparent hover:scale-110  text-white  text-2xl font-semibold hover:shadow-lg hover:text-[#0f6c38] ">{props.b}</button>
    </div>
  )
}

export default Cbtn
