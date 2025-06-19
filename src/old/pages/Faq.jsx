import React, { useState } from 'react';
import Navbar from '../old/componets/Navbar';
import Okmain from '../old/componets/feqq';
import Footer from '../old/componets/Footer';
import LastF from '../old/componets/LastF';

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