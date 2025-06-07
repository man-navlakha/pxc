import React from 'react'
import Navbar from '../componet/Navbar'
import Hero from '../componet/Hero'
import '../new.css'
import Feature from '../componet/feature'
import AskJavaQuestion from '../../componets/AskJavaQuestion'

const MainPage = () => {
  return (
    <>

      <div className="bg-pattern "></div>
      <div className='geist h-screen text-white overflow-scroll flex flex-col text-center content-center flex-nowrap  gap-3  ' style={{ background: "radial-gradient(circle, rgb(10, 121, 45), #000)" }}>
        <Navbar />

        <Hero />
        <Feature />
      </div>
    </>
  )
}

export default MainPage
