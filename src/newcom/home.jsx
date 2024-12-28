import React from 'react'
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar'
import LastF from './LastF'
import Sub from './Sub';


const Home = () => {
    const navigate = useNavigate();
  
    const handleNavigation = (course) => {
      navigate(`/sub?course=${course}`);
    };
  
    const scrollableStyle = {
        overflowY: 'scroll',
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none', /* IE and Edge */
    };
    
  return (
    <div className="flex relative flex-col w-full min-h-screen bg-white">
<Navbar className="sticky top-0 " />

    <div className="text-left w-full mb:max-w-mb lg:max-w-full p-4">
        <p className="text-lg">Welcome,</p>
        <h1 className="text-3xl font-bold text-emerald-700">Man Navlakha</h1>
        
        <p className="mt-4 text-sm">Favorite Cource</p>
        <div style={scrollableStyle}  className="fav overflow-x-scroll mt-4 md:max-w-full md:h-full p-4 lg:max-w-full flex gap-4">
            <button onClick={() => handleNavigation('BCA')} className="bg-emerald-200 text-xl font-semibold py-4 rounded-lg p-4">BCA</button>
            <button onClick={() => handleNavigation('MSCIT')} className="bg-emerald-200 text-xl font-semibold py-4 rounded-lg p-4">MSCIT</button>
            <button onClick={() => handleNavigation('BSCIT')} className="bg-emerald-200 text-xl font-semibold py-4 rounded-lg p-4">BSCIT</button>
            <button onClick={() => handleNavigation('Nursing')} className="bg-emerald-200 text-xl font-semibold py-4 rounded-lg p-4">Nursing</button>
        </div>
        <p className="mt-4 text-sm">Select your course</p>
        <div className="grid grid-cols-2 p-4 lg:grid-cols-4 gap-4 mt-4">
            <button onClick={() => handleNavigation('BCA')} className="bg-emerald-200 text-xl font-semibold py-4 rounded-lg">BCA</button>
            <button onClick={() => handleNavigation('MSCIT')} className="bg-emerald-200 text-xl font-semibold py-4 rounded-lg">MSCIT</button>
            
            <button onClick={() => handleNavigation('BSCIT')} className="bg-emerald-200 text-xl font-semibold py-4 rounded-lg p-4">BSCIT</button>
            <button onClick={() => handleNavigation('Nursing')} className="bg-emerald-200 text-xl font-semibold py-4 rounded-lg p-4">Nursing</button>
            <button onClick={() => handleNavigation('Bcom')} className="bg-emerald-200 text-xl font-semibold py-4 rounded-lg p-4">Bcom</button>
            <button onClick={() => handleNavigation('MCom')} className="bg-emerald-200 text-xl font-semibold py-4 rounded-lg p-4">Mcom</button>
        </div>
    </div>
    <LastF/>
</div>
  )
}

export default Home
