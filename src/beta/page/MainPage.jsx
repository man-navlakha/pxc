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

const MainPage = () => {

          const token = Cookies.get("access_token");
        

  return (
    <>
    <div className='bg-black Mont'>


      <div className="bg-pattern "></div>
        <div className='geist text-white overflow-scroll flex flex-col text-center content-center flex-nowrap  gap-3 mb-2 bg-gradient-to-b from-green-900  to-transparent' >
        <Navbar />
{
  token ? <View/> : <>
        <Hero />
        {/* <Feature /> */}
       <Feature />
  </>
  
}
      </div>
      {/* <div className='geist h-screen text-white overflow-scroll flex flex-col text-center content-center flex-nowrap  gap-3  ' style={{ background: "radial-gradient(circle, rgb(10, 121, 45), #000)" }}>
      </div> */}
      <Footer/>

      </div>
    </>
  )
}

export default MainPage
