import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import LastF from './LastF';

const Team = () => {
  return (
    <>
    <Navbar />
    <div className=" text-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-4">
          Our leadership team
        </h1>
        <p className="text-center text-lg mb-8">
          With over frontend & backend combined experience, we've got a well-seasoned team at the helm.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 sm:gap-16 md:gap-16 lg:gap-96">
          <div className="text-center">
            <img
              alt="Portrait of Dhruv Sharma"
              className="w-full h-auto mb-4"
              height="200"
              src="https://ik.imagekit.io/pxc/t-dhruv-removebg.png"
              width="200"
            />
            <h2 className="text-xl fj-black font-bold">
              Dhruv Sharma
            </h2>
            <p className="text-gray-600">
              CO-FOUNDER & CO-CEO
            </p>
          </div>
          <div className="text-center">
            <img
              alt="Portrait of Man Navlakha"
              className="w-full h-auto mb-4"
              height="200"
              src="https://ik.imagekit.io/pxc/t-man-removebg.png"
              width="200"
            />
            <h2 className="text-xl fj-black font-bold">
              Man Navlakha
            </h2>
            <p className="text-gray-600">
              CO-FOUNDER & CO-CEO
            </p>
          </div>
        </div>
      </div>
    </div>
    <div className="lg:hidden md:block block">
      <LastF />
        
      </div>
      <div className="mt-20">
        
      <Footer />
      </div>
    </>
  );
};

export default Team;