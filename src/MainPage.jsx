import React, { useState } from 'react'
import Navbar from './componet/Navbar'
import Hero from './componet/Hero'
import './new.css'
import Cookies from "js-cookie";
import Feature from './componet/feature'
import Footer from './componet/Footer';
import View from './componet/View';
import Faq from './componet/Faq';
import Semester from './page/Sem';

const MainPage = () => {

  const token = Cookies.get("access_token");


  return (
    <>
      <div className='bg-black ccf'>


        <div className="bg-pattern transition-all duration-500 ease-in-out"></div>
        <div className='ccf text-white flex flex-col text-center content-center flex-nowrap' >
          <Navbar />
          {
            token ? <>
              <Semester />
            </>
              : <>
                <Hero />
                <Feature />
              </>

          }
          <Faq />
        </div>
        <Footer />

      </div>
    </>
  )
}

export default MainPage
