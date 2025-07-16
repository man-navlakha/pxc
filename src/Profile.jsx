import React, { useState, useEffect } from 'react';
import './new.css'
import Cookies from "js-cookie";
import Navbar from './componet/Navbar'
import Footer from './componet/Footer'
import axios from "axios";

const Profile = () => {
  const Username = Cookies.get("username");
  const sem = Cookies.get("latest_sem");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Username) return;
    setLoading(true);
    axios.post('https://pixel-classes.onrender.com/api/Profile/details/', { username: Username })
      .then(res => setProfile(res.data))
      .catch(() => setError("Failed to load profile details"))
      .finally(() => setLoading(false));
  }, [Username]);

  return (
    <>
      <div className="bg-pattern"></div>

      <div className='mesh_profile ccf text-white h-full min-h-screen'>
        <Navbar />
        <div className='flex flex-col items-center mt-10 justify-center'>
          <div>
            <span className='text-center text-md my-3 font-medium'>Hello 👋,</span>
          </div>
          <div>
            <span className='text-center m-3 text-4xl md:text-lg lg:text-5xl font-black bg-clip-text bg-gradient-to-tr from-blue-300 to-green-500 text-transparent ccf '>{Username || "Guest"}</span>
          </div>
          <div className='flex flex-col items-center justify-center text-black'>
            <div className='max-w-[60px] rounded-3xl'>
              <img className=' rounded-3xl' src="https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png" alt="img" />
            </div>
            <div className='flex font-bold'>
              <div className='py-2 flex items-center gap-2 text-md px-3 bg-red-500 rounded-l'>
                <span className="material-symbols-outlined">
                  logout
                </span> Logout
              </div>
              <div className='py-2 flex items-center gap-2 text-md px-3 bg-white rounded-r'>
                <span className="material-symbols-outlined">
                  edit_square
                </span>  Update
              </div>
            </div>
          </div>
        </div>
        <div className='p-6 rounded-t-[40px] border-t-2 h-max overflow-scroll mt-10 profile_2'>
          <span className='text-center text-md my-3 font-bold text-white flex items-center gap-2 text-xl'>
            <span className="material-symbols-outlined">
              timeline
            </span> Your activity
          </span>
          <div className='text-center p-2 bg-green-900 font-medium border border-green-600 text-green-200 rounded-lg'>
            Last selected sem is: <strong>{sem}</strong>
          </div>
          {/* Show loading, error, or profile details */}
          {loading && <div className="text-center text-white mt-4">Loading profile...</div>}
          {error && <div className="text-center text-red-400 mt-4">{error}</div>}
          {profile && (
            <div className="mt-4 text-white text-center">
              {/* Render profile details here */}
              <div><b>Email:</b> {profile.email}</div>
              <div><b>Full Name:</b> {profile.profile_pic}</div>
              {/* Add more fields as needed */}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Profile
