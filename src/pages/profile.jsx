import React from 'react';
import 'tailwindcss/tailwind.css';
import Cookies from 'js-cookie';
import GoBack from '../componets/GoBack';
import LastF from '../componets/LastF';
import Footer from '../componets/Footer';
import { useNavigate } from 'react-router-dom'; // Make sure to import useNavigate
import { useEffect } from 'react'; // Import useEffect

const username = Cookies.get('username') || 'John Doe';
const Profile = () => {
  const navigate = useNavigate(); // Initialize navigate
  
  const handleLogoutClick = () => {
    navigate('/logout');
  };
  const handleUpdateClick = () => {
    alert("Coming Soon");
  };
    useEffect(() => {
      const token = Cookies.get('access_token');
      if (token) {
        // navigate('/'); // Redirect to home if already logged in
      }else{
        navigate('/login');
      }
    }, [navigate]);
  

    return (
        <>
        <GoBack />
        <div className="flex flex-col items-center p-6  ">
            <div className="bg-[#e9e9e9] dark:bg-[#383838] shadow-md rounded-lg p-6 w-full max-w-md">
                <div className="flex flex-col items-center">
                    <img src="https://ik.imagekit.io/pxc/def.jpg" alt="Profile" className="w-32 h-32 rounded-full mb-4" />
                    <h1 className="text-2xl font-bold mb-2">{username}</h1>
                

                </div>
                <div className="profile-content">
                    {/* Add your profile content here */}
                    <div className='flex justify-between m-3 p-4'>
                      <div className='bg-red-500 px-6 py-2 rounded-xl'onClick={handleLogoutClick} >Logout</div>
                      <div className='bg-emerald-500 px-6 py-2 rounded-xl' onClick={handleUpdateClick}>Update Profile</div>
                    </div >
                </div>
            </div>
        </div>
        <LastF />
        <Footer />
        </>
       
    );
}

export default Profile;