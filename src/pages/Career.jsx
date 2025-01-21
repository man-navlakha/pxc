import React, { useState } from 'react';
import Navbar from '../componets/Navbar';
import LastF from '../componets/LastF';
import Footer from '../componets/Footer';

const Career = () => {

    const [openSection, setOpenSection] = useState(null);

    const toggleContent = (id) => {
      setOpenSection(openSection === id ? null : id);
    };
  
  return (<>
    <Navbar />
    <div className="bg-black text-white">
      <div className="text-center py-10">
        <h1 className="text-2xl">Better Together</h1>
        <h2 className="text-4xl">Join the crew</h2>
      </div>
      <div className="bg-white 
      text-black p-10">
      <h1>No matter where you are in your career, we have a role for you.</h1>
      <h3>but not now</h3>
      </div>
    </div>

    <div className="lg:hidden md:block block">
      <LastF />
        
      </div>
      <div className="mt-36">
        
      <Footer />
      </div>
          </>
  )
}

export default Career
