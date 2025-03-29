
import GoBack from '../componets/GoBack'
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

const Choose = () => {
    const [course, setCourse] = useState('');
      const [sub, setSub] = useState('');

      useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const courseParam = urlParams.get('course');
        const subParam = urlParams.get('sub');
    
        if (courseParam) setCourse(courseParam);
        if (subParam) setSub(subParam);
      }, []);
    
const navigate = useNavigate();

const handleClick = (choose) => {
    choose === 'Notes' && navigate(`/select?course=${course}&sub=${sub}&choose=${choose}`);
    choose === 'Assignment' && navigate(`/select?course=${course}&sub=${sub}&choose=${choose}`);
    choose === 'Exam' && navigate(`/exam?course=${course}&sub=${sub}&choose=${choose}`);
    choose === 'I.M.P' &&
    navigate(`/select?course=${course}&sub=${sub}&choose=${choose}`);
};

return (
    <div>
        <div className='dark:bg-[#1E1E1E] dark:text-white h-screen overflow-hidden'>
            <GoBack />
            <div className="p-4 w-full">
                <h1 className="text-4xl text-left f-black font-bold">
                    📘 {course}
                </h1>
                <h2 className="text-2xl pt-2 text-left f-black font-bold">
                    {sub}
                </h2>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-[2rem] pb-3 p-6 man_off'>
                <div onClick={() => handleClick('Notes')} className="content-center text-center hover:border-[#065f46] w-man h-[100px] p-2 border bg-white dark:bg-[#383838] rounded-lg shadow-[0px_4px_0px_0px_#065f46]">
                    Notes
                </div>
                <div onClick={() => handleClick('Assignment')} className="content-center text-center hover:border-[#065f46] w-man h-[100px] p-2 border bg-white dark:bg-[#383838] rounded-lg shadow-[0px_4px_0px_0px_#065f46]">
                    Assignments
                </div>
                <div onClick={() => handleClick('Exam')} className="content-center text-center hover:border-[#065f46] w-man h-[100px] p-2 border bg-white dark:bg-[#383838] rounded-lg shadow-[0px_4px_0px_0px_#065f46]">
                    Exam Papers
                </div>
                <div onClick={() => handleClick('I.M.P')} className="content-center text-center hover:border-[#065f46] w-man h-[100px] p-2 border bg-white dark:bg-[#383838] rounded-lg shadow-[0px_4px_0px_0px_#065f46]">
                    Important Questions
                </div>
            </div>
        </div>
    </div>
);
}

export default Choose
