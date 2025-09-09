import React, { useState, useEffect } from "react";
import Navbar from "./componet/Navbar";
import Hero from "./componet/Hero";
import Feature from "./componet/feature";
import Footer from "./componet/Footer";
import FloatingMessagesButon from "./componet/FloatingMessagesButton";
import Faq from "./componet/Faq";
import Semester from "./page/Sem";
import Loading from "./componet/Loading";
import api from "./utils/api"; // axios with withCredentials:true
import "./new.css";

const MainPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const res = await api.get("/me/"); // Checks if user is logged in
        if (res.data?.username) {
          setProfile(res.data);
        } else {
          setProfile(null);
        }
      } catch (err) {
        setProfile(null); // Not authenticated
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <Loading />; // Show spinner while checking auth

  return (
    <div className="bg-black ccf text-white">
      <Navbar />

      {profile ? (
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
  );
};

export default MainPage;
