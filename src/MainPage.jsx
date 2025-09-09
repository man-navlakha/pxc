import React, { useState, useEffect } from "react";
import Navbar from "./componet/Navbar";
import Hero from "./componet/Hero";
import Feature from "./componet/feature";
import Footer from "./componet/Footer";
import FloatingMessagesButon from "./componet/FloatingMessagesButton";
import Faq from "./componet/Faq";
import Semester from "./page/Sem";
import Loading from "./componet/Loading";
import api from "./utils/api";
import "./new.css";

const MainPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await api.get("/me/");
        setProfile(res.data);
      } catch (err) {
        setProfile(null); // user not logged in
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="bg-black ccf text-white">
      <Navbar />

      {profile ? (
        <Semester /> // logged-in view
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