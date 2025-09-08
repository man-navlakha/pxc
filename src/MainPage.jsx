import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

import Navbar from "./componet/Navbar";
import Hero from "./componet/Hero";
import Feature from "./componet/feature";
import Footer from "./componet/Footer";
import FloatingMessagesButton from "./componet/FloatingMessagesButton";
import Faq from "./componet/Faq";
import Semester from "./page/Sem";
import Loading from "./componet/Loading";

import api from "./utils/api"; // axios instance with interceptor

import "./new.css";

const MainPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profile (if logged in) or guest courses
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await api.get("/me/");
      setProfile(res.data);
    } catch (err) {
      console.warn("Not logged in → guest mode");
      setProfile(null); // show guest content instead of redirecting
    } finally {
      setLoading(false);
    }
  };
  fetchProfile();
}, []);

  // Update profile picture cookie only if we have profile data
  useEffect(() => {
    if (!profile) return;
    Cookies.set(
      "profile_pic",
      profile.profile_pic || "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png"
    );
  }, [profile]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="text-red-500 text-center my-4 bg-white ccf text-3xl">
        {error}
        <a href="/logout">
          <br />
          <button className="border px-6 py-3 m-2 rounded bg-red-600/20 border-red-600">
            Logout
          </button>
        </a>
        <a href="/">
          <br />
          <button className="border px-6 py-3 m-2 rounded bg-red-600/20 border-red-600">
            Reload
          </button>
        </a>
      </div>
    );
  }

  return (
    <div className="bg-black ccf">
      <div className="bg-pattern transition-all duration-500 ease-in-out"></div>

      <div className="ccf text-white flex flex-col text-center pb-14 lg:pb-0 md:pb-14 content-center flex-nowrap">
        <Navbar />

        {profile?.username ? (
          <Semester /> // Logged-in view
        ) : (
          <>
            <Hero />
            <Feature />
          </>
        )}

        <FloatingMessagesButton />
        <Faq />
        <Footer />
      </div>
    </div>
  );
};

export default MainPage;
