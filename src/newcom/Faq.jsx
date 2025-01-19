import React, { useState } from 'react';
import Navbar from './Navbar';
import Okmain from './faq/feqq';
import Footer from './Footer';
import LastF from './LastF';

const Faq = () => {
 
  return (
    <>
    <Navbar />
    <Okmain />
    <div className="lg:hidden md:block block">
      <LastF />
        
      </div>
      <div className="mt-22">
        
      <Footer />
      </div>
    </>
  );
};

export default Faq;