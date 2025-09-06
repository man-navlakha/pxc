import React, { useState, useEffect } from 'react';
import axios from "axios";
import Cookies from "js-cookie";

import Navbar from './componet/Navbar';
import Hero from './componet/Hero';
import Feature from './componet/feature';
import Footer from './componet/Footer';
import FloatingMessagesButon from './componet/FloatingMessagesButton';

import Faq from './componet/Faq';
import Semester from './page/Sem';
import Loading from './componet/Loading'; // ✅ Import the loading component

import './new.css';

const MainPage = () => {
  const token = Cookies.get("refresh_token");
  const username = Cookies.get("username");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const userToFetch = username;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (token && userToFetch) {
          // Clear cookies
          ['sub', 'pdfname', 'pdfid', 'pdfyear', 'pdfurl', 'pdfSizes', 'choose'].forEach(Cookies.remove);

          const res = await axios.post('https://pixel-classes.onrender.com/api/Profile/details/', {
            username: userToFetch,
          });
          setProfile(res.data);
        } else {
          const res = await axios.get('https://pixel-classes.onrender.com/api/home/courses');
          setProfile(res.data);
        }
      } catch (err) {
        setError("Failed to load details");
      } finally {
        handleLoading();
      }
    };

    fetchData();
  }, [token, username]);

  const handleLoading = () => {
    setTimeout(() => {
      setLoading(false);
    }, 0); // change to 3000 if you want a visible delay
  };

  useEffect(() => {
    if (profile && profile.profile_pic) {
      Cookies.set("profile_pic", profile.profile_pic);
    } else {
      Cookies.set("profile_pic", "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png");
    }
  }, [profile]);


  return (
    <>
      {loading ? (
        <Loading />
      ) : error ? (
        <div className="text-red-500 text-center my-4 bg-white ccf text-3xl">{error} <a href="/logout"><br /><button className='border px-6 py-3 m-2 rounded bg-red-600/20 border-red-600'>Logout</button></a><a href="/"><br /><button className='border px-6 py-3 m-2 rounded bg-red-600/20 border-red-600'>Reload</button></a></div>
      ) : (
        <div className='bg-black ccf'>
          <div className="bg-pattern transition-all duration-500 ease-in-out"></div>
          <div className='ccf text-white flex flex-col text-center pb-14 lg:pb-0 md:pb-14 content-center flex-nowrap'>
            <Navbar />

            {token ?

             <Semester /> 

             :
             
              <>
                <Hero />
                <Feature />
              </>
              
              }

            {/* <section className="flex items-center justify-center min-h-screen mesh_sem2 px-6 py-20">
              <div className=" max-w-4xl w-full p-10 rounded-3xl text-center">
                <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-6">Chat With Friend</h1>
                <p className="text-lg md:text-xl lg:text-xl mb-6">Real-time messaging with friends and classmates. Stay connected, collaborate, and have fun — wherever you are.</p>
                <a href="/chat" className="inline-block text-xl bg-white text-gray-900 font-semibold py-3 px-6 rounded-full hover:bg-gray-200 transition">Start Chatting</a>

                <div className="mt-10 flex justify-center">
                        <img src="bgp.png" alt="Chat Screenshot" className="" />
                    </div> 
              </div>
            </section> */}

            <FloatingMessagesButon />

            <Faq />
            <Footer />
          </div>
        </div>
      )}
    </>

  );
};

export default MainPage;
