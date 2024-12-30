import React from 'react'
import { useLocation } from 'react-router-dom';
import GoBack from './GoBack';



const Sub = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const courseName = queryParams.get('course');
  
    console.log(courseName);
  
  return (
    <div className="text-center">
        <GoBack />
        <div className="bg-white p-4 w-full">
    <h1 className="text-4xl text-left font-bold">{courseName}</h1>
    <h2 className="text-3xl text-left font-bold">Collations</h2>
    </div>
    <p className="mt-4 text-left pl-3 text-lg">Select your subject</p>
    <div className="mt-6 space-y-4 p-4">
        <div className="flex items-center p-4 bg-gray-200 rounded-full shadow-md">
            <img src="https://placehold.co/50x50" alt="Icon for Data Structure & Algorithm" className="rounded-lg w-12 h-12 mr-4"/>

            <span className="text-lg font-medium">Data Structure & Algorithm</span>
        </div>
        <div className="flex items-center p-4 bg-gray-200 rounded-full shadow-md">
            <img src="https://placehold.co/50x50" alt="Icon for Data Structure & Algorithm" className="rounded-lg w-12 h-12 mr-4"/>
            <span className="text-lg font-medium">Data Structure & Algorithm</span>
        </div>
        <div className="flex items-center p-4 bg-gray-200 rounded-full shadow-md">
            <img src="https://placehold.co/50x50" alt="Icon for Python" className="rounded-lg w-12 h-12 mr-4"/>
            <span className="text-lg font-medium">Python</span>
        </div>
        <div className="flex items-center p-4 bg-gray-200 rounded-lg shadow-md">
            <img src="https://placehold.co/50x50" alt="Icon for Numeric methods" className="rounded-lg w-12 h-12 mr-4"/>
            <span className="text-lg font-medium">Numeric methods</span>
        </div>
        <div className="flex items-center p-4 bg-gray-200 rounded-lg shadow-md">
            <img src="https://placehold.co/50x50" alt="Icon for OS system" className="rounded-lg w-12 h-12 mr-4"/>
            <span className="text-lg font-medium">OS system</span>
        </div>
        <div className="flex items-center p-4 bg-gray-200 rounded-full shadow-md">
            <img src="https://placehold.co/50x50" alt="Icon for Python" className="rounded-lg w-12 h-12 mr-4"/>
            <span className="text-lg font-medium">Python</span>
        </div>
        <div className="flex items-center p-4 bg-gray-200 rounded-lg shadow-md">
            <img src="https://placehold.co/50x50" alt="Icon for Numeric methods" className="rounded-lg w-12 h-12 mr-4"/>
            <span className="text-lg font-medium">Numeric methods</span>
        </div>
        <div className="flex items-center p-4 bg-gray-200 rounded-lg shadow-md">
            <img src="https://placehold.co/50x50" alt="Icon for OS system" className="rounded-lg w-12 h-12 mr-4"/>
            <span className="text-lg font-medium">OS system</span>
        </div>
    </div>
</div>
  )
}

export default Sub
