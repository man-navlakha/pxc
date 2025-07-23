import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
       <div class="backdrop-blur-[7.2px] bg-white/0 border border-white/35 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] p-10 text-center text-white max-w-md">
    <h1 class="text-6xl font-bold">404</h1>
    <p class="text-xl mt-4">Sorry, the page you’re looking for doesn’t exist.</p>
    <a href="/" class="inline-block mt-6 px-6 py-3 border border-white/50 rounded-xl transition duration-300 hover:bg-white/20">
      Back to Home
    </a>
  </div>
    </div>
  );
};

export default NotFound;