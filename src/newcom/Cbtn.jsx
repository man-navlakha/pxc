import React from 'react'

const Cbtn = (props) => {
  return (
    <div className='hover:f-black '>
      <button className="py-4 w-full  hover:bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-lime-600  to-emerald-100 border-emerald-800 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-lime-600  to-emerald-300 hover:border-emerald-200  text-2xl font-semibold hover:shadow-lg hover:text-white rounded-lg">{props.b}</button>
    </div>
  )
}

export default Cbtn
