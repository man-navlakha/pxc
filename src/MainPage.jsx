import React, { useState, useEffect } from 'react';
import axios from "axios";
import Cookies from "js-cookie";

import Navbar from './componet/Navbar';
import Hero from './componet/Hero';
import Feature from './componet/feature';
import Footer from './componet/Footer';
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
    }, 3000);
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
        <div className="text-red-500 text-center my-4 bg-white">{error} <a href="/logout"><button>Fix It</button></a></div>
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


            <Faq />
            <Footer />
          </div>
        </div>
      )}
    </>

  );
};

export default MainPage;
