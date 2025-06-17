import React, { useState } from 'react'
import Navbar from '../componet/Navbar'
import Hero from '../componet/Hero'
import '../new.css'
import Cookies from "js-cookie";
import Feature from '../componet/feature'
import AskJavaQuestion from '../../componets/AskJavaQuestion'
import Footer from '../componet/Footer';
import Semester from './Sem';
import View from '../componet/View';
import Faq from '../componet/Faq';

const MainPage = () => {

  const token = Cookies.get("access_token");


  return (
    <>
      <div className='bg-black ccf'>


        <div className="bg-pattern "></div>
        <div className='ccf text-white flex flex-col text-center content-center flex-nowrap' >
          <Navbar />
          {
            token ? <>
              <View />
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
