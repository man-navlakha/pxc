import React from 'react';
import GoBack from '../componets/GoBack';
import { useParams } from 'react-router-dom';

const Subject = () => {
  const { course } = useParams(); // Get the course parameter from the URL

  return (
    <div>
      <GoBack />
      <div className="bg-white p-4 w-full">
        <h1 className="text-4xl text-left font-bold">
          📘 {course}
        </h1>
      </div>

      <div className="z-1 rounded-t-lg -m-sm">
      <div className="block shadow-[inset_0px_4px_4px_rgba(0,0,0)] overflow-hidden rounded-t-3xl">
        </div>
        </div>
    </div>
  );
};

export default Subject;