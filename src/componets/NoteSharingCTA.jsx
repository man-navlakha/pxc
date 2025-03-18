import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSyncAlt,
  faMobileAlt,
  faTasks,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

const NoteSharingCTA = () => {
  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className=" p-8  flex flex-col md:flex-row items-center md:items-start">
        <div className="md:w-1/2 md:pr-8">
          <h1 className="text-sm font-medium  mb-2">Share</h1>
          <h2 className="text-3xl font-bold  mb-4">
            Effortless Note Sharing for Everyone
          </h2>
          <p className=" mb-6">
            Experience seamless collaboration with our note-sharing platform.
            Share ideas, insights, and information effortlessly with your team
            or friends.
          </p>
          <ul className="space-y-4 mb-6">
            <li className="flex items-start">
              <FontAwesomeIcon icon={faSyncAlt} className=" text-xl mr-3" />
              <span className="">
                Connect and collaborate in real-time.
              </span>
            </li>
            <li className="flex items-start">
              <FontAwesomeIcon icon={faMobileAlt} className=" text-xl mr-3" />
              <span className="">
                Access notes anytime, anywhere with ease.
              </span>
            </li>
            <li className="flex items-start">
              <FontAwesomeIcon icon={faTasks} className=" text-xl mr-3" />
              <span className="">
                Stay organized and boost your productivity.
              </span>
            </li>
          </ul>
          <div className="flex space-x-4">
            <button className="px-4 py-2 border border-gray-700  rounded ">
              Learn More
            </button>
            <button className="px-4 py-2 border border-gray-700  rounded  flex items-center">
              Sign Up
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </button>
          </div>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0">
          <img
            src="https://storage.googleapis.com/a1aa/image/X8Np-UwZ3vuhP8cwcKy6TwmJocqduhYUAhDx1rbqvhk.jpg"
            alt="Placeholder image for note sharing platform"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default NoteSharingCTA;