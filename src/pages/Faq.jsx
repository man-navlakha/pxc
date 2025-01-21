import React, { useState } from 'react';
import Navbar from '../componets/Navbar';
import Okmain from '../componets/feqq';
import Footer from '../componets/Footer';
import LastF from '../componets/LastF';

const Faq = () => {
 
  return (
    <>
    <Navbar />
    <Okmain />
    <div className="lg:hidden md:block block">
      <LastF />
        
      </div>
      <div className="mt-36">
        
      <Footer />
      </div>
    </>
  );
};

export default Faq;