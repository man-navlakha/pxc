import React from 'react';
// import { useLocation } from 'react-router-dom';

const Card = (props) => {
    //  const location = useLocation();
    //     const queryParams = new URLSearchParams(location.search);
    //     const courseName = queryParams.get('course');
      
        // console.log(b.b);
  return (
    <div className="div h-[4em] w-32 hover:shadow-md hover:border-emerald-500 border-emerald-800 border-2 bg-white m-auto rounded-[1em] overflow-hidden relative group p-2 z-0">
      <div className="circle absolute h-[5em] w-[5em]  -top-[2.5em] border-emerald-800 border-2 blur-[5px] -right-[2.5em] rounded-full bg-emerald-200 group-hover:scale-[800%] duration-500 z-[-1] op" />
      <div className="circle absolute h-[5em] w-[5em]  -bottom-[2.5em] border-emerald-800 border-2 blur-[15px] -left-[1.5em] rounded-full bg-emerald-100 group-hover:scale-[800%] duration-700 z-[-1] op" />

      <h1 className="z-20 text-emerald-800 font-bold font-Poppin group-hover:text-emerald-800 duration-500 text-[1.4em]">
        {props.b}
      </h1>
    </div>
  );
}

export default Card;
