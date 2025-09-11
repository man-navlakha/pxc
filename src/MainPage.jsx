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
import Cookies from "js-cookie";

const MainPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("Logged")

useEffect(() => {
  const checkAuth = async () => {
    setLoading(true);
    try {
      const res = await api.get("/me/working"); // Checks if user is logged in
      console.log("working", res.data);
      Cookies.set("Logged", "true"); // Set to string for cookie compatibility
    } catch (err) {
      console.error("Authentication check failed:", err);
      Cookies.set("Logged", "false"); // Cookies only store strings
    } finally {
      setLoading(false);
    }
  };

  // Only run checkAuth if token is not explicitly false
  if (token !== false) {
    console.log("Check Auth");
    checkAuth();
  } else {
    setLoading(false);
  }
}, [token]);


  if (loading) return <Loading />; // Show spinner while checking auth

  return (
    <div className="bg-black ccf text-white">
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
  );
};

export default MainPage;
