import React from "react";
import Main_img from "../assets/img/Maintenance-bro.png";

const MaintenancePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-black text-center p-4">
      <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-50">We'll be back soon!</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          Our website is currently undergoing scheduled maintenance.
          We appreciate your patience and will be back shortly.
        </p>
        <div className="animate-pulse">
            <img src={Main_img} alt="" />
          {/* <svg
            className="w-16 h-16 text-emerald-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg> */}
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
