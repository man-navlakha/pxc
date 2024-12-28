import React from 'react'
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar'
import LastF from './LastF'
import Sub from './Sub';
import Card from './Card';
import Cbtn from './Cbtn';
import '../index.css'; // Import css file


const Home = () => {
    // const navigate = useNavigate();
  
    // const handleNavigation = (course) => {
    //   navigate(`/sub?course=${course}`);
    // };

    const courses = ['BCA', 'MSCIT', 'BBA', 'BCIT', 'BCOM','Nursing','B.Tech']; // Array of courses

  
    const scrollableStyle = {
        overflowY: 'scroll',
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none', /* IE and Edge */
    };
    
  return (
    <div className="flex relative flex-col w-full min-h-screen bg-white">
<Navbar className="sticky top-0 " />

    <div className="text-left w-full mb:max-w-mb lg:max-w-full p-4">
        <p className="text-lg ">Welcome,</p>
        {/* <h1 className="text-3xl font-ff font-bold text-emerald-700">Man Navlakha</h1> */}
        
        <p className="mt-4 text-sm font-bold">Favorite Cource</p>
        <div style={scrollableStyle}  className="fav overflow-x-scroll -mx-4 mt-4 md:max-w-full md:h-full p-4 lg:max-w-full flex gap-4">
            
        
      {courses.map((course, index) => (
        <Link key={index} to={`/sub?course=${course}`}>
          <Card b={course} />
        </Link>
      ))}
       
        {/* <div onClick={() => handleNavigation('BCA')} className=" drop-shadow-xl w-48 h-64 overflow-hidden rounded-xl bg-[#3d3c3d]">
      <div className="absolute flex items-center justify-center text-white z-[1] opacity-90 rounded-xl inset-0.5 bg-emerald-900/50">
        BCA
      </div>
      <div className="absolute w-56 h-48 bg-white -left-1/2 -top-1/2" />
    </div> */}
   
            {/* <button onClick={() => handleNavigation('BCA')} className="bg-emerald-200 border-emerald-800 hover:bg-emerald-700 hover:border-emerald-200  text-xl font-semibold hover:shadow-md hover:text-white  py-4 rounded-lg p-4">BCA</button>
            <button onClick={() => handleNavigation('MSCIT')} className="bg-emerald-200 border-emerald-800 hover:bg-emerald-700 hover:border-emerald-200  text-xl font-semibold hover:shadow-md hover:text-white  py-4 rounded-lg p-4">MSCIT</button>
            <button onClick={() => handleNavigation('BSCIT')} className="bg-emerald-200 border-emerald-800 hover:bg-emerald-700 hover:border-emerald-200  text-xl font-semibold hover:shadow-md hover:text-white  py-4 rounded-lg p-4">BSCIT</button>
            <button onClick={() => handleNavigation('Nursing')} className="bg-emerald-200 border-emerald-800 hover:bg-emerald-700 hover:border-emerald-200  text-xl font-semibold hover:shadow-md hover:text-white  py-4 rounded-lg p-4">Nursing</button> */}
        </div>




        <p className="mt-4 text-sm font-bold">Select your course</p>
        <div className="grid grid-cols-2 p-4 lg:grid-cols-6 gap-4 mt-4">
        {courses.map((course, index) => (
        <Link key={index} to={`/sub?course=${course}`}>
          <Cbtn b={course} />
        </Link>
      ))}
        </div>
    </div>
    <LastF/>
</div>
  )
}

export default Home
