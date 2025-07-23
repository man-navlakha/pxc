import React, { useState, useEffect } from 'react';

import axios from "axios";
import Navbar from './componet/Navbar'
import Hero from './componet/Hero'
import './new.css'
import Cookies from "js-cookie";
import Feature from './componet/feature'
import Footer from './componet/Footer';
import View from './componet/View';
import Faq from './componet/Faq';
import Semester from './page/Sem';

const MainPage = () => {

  const token = Cookies.get("access_token");
  const username = Cookies.get("username");
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);


  useEffect(() => {
    const userToFetch = username;
    if (!userToFetch) return;
    setLoading(true);
    axios.post('https://pixel-classes.onrender.com/api/Profile/details/', { username: userToFetch })
      .then(res => setProfile(res.data))
      .catch(() => setError("Failed to load profile details"))
      .finally(() => setLoading(false));
  }, [username]);
Cookies.set("profile_pic", profile?.profile_pic
                          ? profile.profile_pic
                          : "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png");
  return (
    <>
      <div className='bg-black ccf'>
        <div className="bg-pattern transition-all duration-500 ease-in-out"></div>
        <div className='ccf text-white flex flex-col text-center pb-14 lg:pb-0 md:pb-14 content-center flex-nowrap' >
          <Navbar />
          {
            token ? <>
              <Semester />
            </>
              : <>
                <Hero />
                <Feature />
              </>

          }
          <Faq />
          <Footer />
        </div>

      </div>
    </>
  )
}

export default MainPage
