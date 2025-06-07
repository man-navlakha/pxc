import React from 'react'
import Navbar from '../componet/Navbar'
import Hero from '../componet/Hero'
import '../new.css'
import Feature from '../componet/feature'

const MainPage = () => {
  return (
    <>

      <div className="bg-pattern "></div>
    <div className='geist h-screen text-white overflow-scroll flex flex-col text-center content-center flex-nowrap jusify-center gap-3 items-center ' style={{ background: "radial-gradient(circle, rgb(8, 73, 29), rgb(0, 0, 0))" }}>
      <Navbar />
    
      <Hero />
      <Feature />
    </div>
    </>
  )
}

export default MainPage
