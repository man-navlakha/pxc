import React, { useState } from 'react'
import Navbar from '../componet/navbar'
import Hero from '../componet/Hero'
import '../new.css'
import Cookies from "js-cookie";
import Feature from '../componet/feature'
import AskJavaQuestion from '../../componets/AskJavaQuestion'
import Footer from '../componet/Footer';

const MainPage = () => {

          const token = Cookies.get("access_token");
        

  return (
    <>

      <div className="bg-pattern "></div>
      <div className='geist h-screen text-white overflow-scroll flex flex-col text-center content-center flex-nowrap  gap-3  ' style={{ background: "radial-gradient(circle, rgb(10, 121, 45), #000)" }}>
        <Navbar />
{
  token ? '' : <>
        <Hero />
        {/* <Feature /> */}
  </>
  
}
      </div>
      <Footer/>

    </>
  )
}

export default MainPage
