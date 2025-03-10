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
    </div>
  );
};

export default Subject;