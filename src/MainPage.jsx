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
import Cookies from "js-cookie";

const MainPage = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Cookies.get("Logged") === "true"
  );

useEffect(() => {
  const checkAuth = async () => {
    setLoading(true);
    try {
      const res = await api.get("/me/working"); // Checks if user is logged in
      console.log("working", res.data);
      Cookies.set("Logged", "true"); // Set to string for cookie compatibility
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Authentication check failed:", err);
      Cookies.set("Logged", "false"); // Cookies only store strings
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  console.log("Check Auth");
  checkAuth();
}, []);


  if (loading) return <Loading />; // Show spinner while checking auth

  return (
    <div className="bg-black ccf text-white">
      <Navbar />

      {isAuthenticated ? (
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
