import React from 'react'
import Navbar from '../componet/navbar'
import Welcome from '../componet/Welcome'
import Search from '../componet/search'
import Hero from '../componet/Hero'
import '../new.css'
import Top from '../componet/Top-H'

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
