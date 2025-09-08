import React, { useState, useEffect } from 'react';
import Cookies from "js-cookie";

import Navbar from './componet/Navbar';
import Hero from './componet/Hero';
import Feature from './componet/feature';
import Footer from './componet/Footer';
import FloatingMessagesButon from './componet/FloatingMessagesButton';
import Faq from './componet/Faq';
import Semester from './page/Sem';
import Loading from './componet/Loading';

import api from './utils/api'; // centralized axios instance with withCredentials

import './new.css';

const MainPage = () => {
  const token = Cookies.get("refresh_token");
  const username = Cookies.get("username");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile or courses
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (token && username) {
          // Clear old cookies
          ['sub', 'pdfname', 'pdfid', 'pdfyear', 'pdfurl', 'pdfSizes', 'choose'].forEach(Cookies.remove);

          // Use centralized axios instance (withCredentials already set)
          const res = await api.post('/Profile/details/', { username });
          setProfile(res.data);
        } else {
          const res = await api.get('/home/courses'); // cookies sent automatically
          setProfile(res.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, username]);

  // Update profile_pic cookie
  useEffect(() => {
    if (profile?.profile_pic) {
      Cookies.set("profile_pic", profile.profile_pic);
    } else {
      Cookies.set("profile_pic", "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png");
    }
  }, [profile]);

  if (loading) return <Loading />;

  return (
    <div className='bg-black ccf'>
      {error && (
        <div className="text-red-500 text-center my-4 bg-white ccf text-3xl">
          {error}
          <a href="/logout"><br /><button className='border px-6 py-3 m-2 rounded bg-red-600/20 border-red-600'>Logout</button></a>
          <a href="/"><br /><button className='border px-6 py-3 m-2 rounded bg-red-600/20 border-red-600'>Reload</button></a>
        </div>
      )}

      <div className="bg-pattern transition-all duration-500 ease-in-out"></div>

      <div className='ccf text-white flex flex-col text-center pb-14 lg:pb-0 md:pb-14 content-center flex-nowrap'>
        <Navbar />

        {token ? (
          <Semester /> // Logged-in view
        ) : (
          <>
            <Hero />
            <Feature />
          </>
        )}

        <FloatingMessagesButon />
        <Faq />
        <Footer />
      </div>
    </div>
  );
};

export default MainPage;
