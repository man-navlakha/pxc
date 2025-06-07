import React from 'react'
import Navbar from '../componet/Navbar'
import Hero from '../componet/Hero'
import '../new.css'

const MainPage = () => {
  return (
    <>

      <div className="bg-pattern"></div>
    <div className='geist h-screen text-white overflow-scroll' style={{ background: "radial-gradient(circle, rgb(8, 73, 29), rgb(0, 0, 0))" }}>
      <Navbar />
    
      <Hero />
    </div>
    </>
  )
}

export default MainPage
