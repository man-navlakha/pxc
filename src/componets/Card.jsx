import React from 'react';
// import { useLocation } from 'react-router-dom';

const Card = (props) => {
    //  const location = useLocation();
    //     const queryParams = newś URLSearchParams(location.search);
    //     const courseName = queryParams.get('course');
      
        // console.log(b.b);
  return (
    <div className="div hover:scale-110 h-[4em] w-32 hover:shadow-md hover:border-emerald-500 border-emerald-800 border-2 bg-white m-auto overflow-hidden relative group p-2 z-0">
      <div className="circle absolute h-[5em] w-[5em]  -top-[3.5em] border-emerald-800 border-2 blur-[5px] -right-[3.5em] bg-emerald-200 group-hover:scale-[800%] duration-500 z-[-1] op" />

      <h1 className="z-20 text-green-900 font-bold font-Poppin group-hover:text-emerald-950 duration-500 text-[1.4em]">
        {props.b}
      </h1>
    </div>
  );
}

export default Card;
