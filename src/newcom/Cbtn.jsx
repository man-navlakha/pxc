import React from 'react'

const Cbtn = (props) => {
  return (
    <div>
      <button className="py-4 w-full bg-emerald-200 border-emerald-800 hover:bg-emerald-700 hover:border-emerald-200  text-xl font-semibold hover:shadow-md hover:text-white rounded-lg">{props.b}</button>
    </div>
  )
}

export default Cbtn
