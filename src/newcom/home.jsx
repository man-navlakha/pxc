import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../componets/Navbar";
import LastF from "../componets/LastF";
import Card from "../componets/Card";
import Cbtn from "../componets/Cbtn";
import Cookies from "js-cookie"; // Importing js-cookie library
import "../index.css"; // Import css file
import Footer from "../componets/Footer";
import Team from "../pages/Team";
import Load from "../componets/Loader";
import axios from "axios"; // Import axios for API calls
import CTA7 from "../componets/CTA7";
import NoteSharingCTA from "../componets/NoteSharingCTA";
import Exam from "../componets/Exam";
import AskJavaQuestion from "../componets/AskJavaQuestion";

const Home = () => {
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [courses, setCourses] = useState([]); // State to store courses
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Retrieve the 'username' cookie value
    const storedUserName = Cookies.get("username");
    console.log("Retrieved userName from cookie:", storedUserName); // Log the cookie value

    if (storedUserName && storedUserName !== "undefined") {
      setUserName(storedUserName); // Set the username from cookie
      setIsLoggedIn(true); // Mark the user as logged in
    } else {
      setUserName("Guest"); // Default name if cookie is not found
      setIsLoggedIn(false); // Mark the user as not logged in
    }

    axios.post("https://pixel-classes.onrender.com/api/home/courses", {})
    .then(response => {
      setCourses(response.data.CourseList); // Set the courses state with the fetched data
      setLoading(false); // Set loading to false after data is fetched
    })
    .catch(error => {
      console.error("Error fetching courses:", error);
      setLoading(false); // Set loading to false in case of error
    });
  }, []);  

  const handleLogout = () => {
    // Remove the username and access_token cookies to log the user out
    Cookies.remove("username");
    Cookies.remove("access_token");

    setUserName("Guest"); // Reset the username to 'Guest'
    setIsLoggedIn(false); // Update the login state to logged out

    // Refresh the page after logout
    window.location.reload(); // Reload the page to reset the UI and state
  };

  return (
    <div className="flex relative flex-col w-full min-h-screen">
      <Navbar className="sticky top-0 " />

      <div className="text-left w-full mb:max-w-mb lg:max-w-full p-4">
        <p className="text-lg">Welcome 👋,</p>
      
        <h1 className="text-3xl title-home font-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500 via-emerable-900 to-green-700 text-transparent bg-clip-text">
          {userName}
        </h1>

        {loading ? (
             <Load />
          ) : (
                  <>
            <div>
                  {isLoggedIn && (

                
                  <>
  
      
        <p className="mt-4 text-sm brife font-bold">Favorite Course</p>
        <div className="fav overflow-x-scroll -mx-4 mt-4 md:max-w-full md:h-full p-4 lg:max-w-full flex gap-4 scrollable-courses">
          {courses
            .filter((course) => course.id === 1)
            .map((course) => (
              <Link key={course.id} to={`/sub?course=${course.name}`}>
                <Card b={course.name} />
              </Link>
            ))}
        </div>
        </>
          )}
        </div>

        
        <p className="mt-4 text-sm brife font-bold">Select your course</p>
        <div className="grid grid-cols-2 p-4 lg:grid-cols-6 gap-4 mt-4">
          {courses.map((course) => (
            <Link key={course.id} to={`/sub?course=${course.name}`}>
              <Cbtn b={course.name} />
            </Link>
          ))}
        </div>
        </>
        )}

        <AskJavaQuestion/>
{/*         
<div  className="">
        <p className="mt-4  text-2xl brife font-black">Start your exam preparation </p>
        <p className="mb-4 text-xl brife font-medium">select and good to go!!!</p>
        <Exam/>
        </div>
         */}
       
      </div>
      <div className="lg:hidden md:block block">
        <LastF />
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
};

export default Home;