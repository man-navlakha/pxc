import React, { useState, useEffect } from 'react';
import axios from "axios";
import Cookies from "js-cookie";

import Navbar from './componet/Navbar';
import Hero from './componet/Hero';
import Feature from './componet/feature';
import Footer from './componet/Footer';
import FloatingMessagesButon from './componet/FloatingMessagesButton';
import View from './componet/View';
import Faq from './componet/Faq';
import Semester from './page/Sem';
import Loading from './componet/Loading'; // ✅ Import the loading component

import './new.css';

const MainPage = () => {
  const token = Cookies.get("access_token");
  const username = Cookies.get("username");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  token ?

    useEffect(() => {
      const userToFetch = username;
      if (!userToFetch) return;

      Cookies.remove('sub');
              Cookies.remove('pdfname');
              Cookies.remove('pdfid');
              Cookies.remove('pdfyear');
              Cookies.remove('pdfurl');
              Cookies.remove('pdfSizes');
              Cookies.remove('choose');

      setLoading(true);
      axios.post('https://pixel-classes.onrender.com/api/Profile/details/', { username: userToFetch })
        .then(res => setProfile(res.data))
        .catch(() => setError("Failed to load profile details"))
        .finally(() => handleLoading());
    }, [username])


    :

    useEffect(() => {
      setLoading(true);
      axios.get('https://pixel-classes.onrender.com/api/home/courses')
        .then(res => setProfile(res.data))
        .catch(() => setError("Failed to load details"))
        .finally(() => handleLoading());
    }, [username])

  const handleLoading = () => {
    // Delay setLoading by 3 seconds (3000 milliseconds)
    setTimeout(() => {
      setLoading(false);
    }, 0);
  };

  // ✅ Set profile_pic cookie only if profile is available
  useEffect(() => {
    if (profile) {
      Cookies.set("profile_pic", profile.profile_pic || "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png");
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

            {token ? <Semester /> :
             <>
              <Hero />
              <Feature />
            </>}

    <section className="flex items-center justify-center min-h-screen mesh_sem2 px-6 py-20">
                <div className=" max-w-4xl w-full p-10 rounded-3xl text-center">
                    <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-6">Chat With Friend</h1>
                    <p className="text-lg md:text-xl lg:text-xl mb-6">Real-time messaging with friends and classmates. Stay connected, collaborate, and have fun — wherever you are.</p>
                    <a href="/chat" className="inline-block text-xl bg-white text-gray-900 font-semibold py-3 px-6 rounded-full hover:bg-gray-200 transition">Start Chatting</a>

                    {/* <div className="mt-10 flex justify-center">
                        <img src="bgp.png" alt="Chat Screenshot" className="" />
                    </div> */}
                </div>
            </section>

<FloatingMessagesButon />
 {/* <button className="fixed bottom-[6rem] left-1/3 transform  flex items-center space-x-4 bg-black rounded-full px-6 py-3 max-w-[240px] w-full shadow-lg z-50">
   <div className="relative">
    <i className="fab fa-facebook-messenger text-white text-xl">
    </i>
    <span className="absolute -top-1 -right-2 bg-[#FF3B30] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center leading-none select-none">
     1
    </span>
   </div>
   <span className="text-white font-semibold text-lg">
    Messages
   </span>
   <img alt="Profile image of a man in a suit with a warm background" className="w-10 h-10 rounded-full object-cover" height="40" src="https://storage.googleapis.com/a1aa/image/4b2997b1-d196-4fb3-243f-dbf759085316.jpg" width="40"/>
  </button> */}

            <Faq />
            <Footer />
          </div>
        </div>
      )}
    </>

  );
};

export default MainPage;
