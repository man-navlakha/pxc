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
import axios from "axios"; // Import axios for API calls

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
        <h1 className="text-3xl font-ff font-bold bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500 via-emerable-900 to-green-700 text-transparent bg-clip-text">
          {userName}
        </h1>

        {isLoggedIn && (
  loading ? (
    <div>Loading...</div>
  ) : (
    <>
      <div>
        <div></div>
        <p className="mt-4 text-sm font-bold">Favorite Course</p>
        <div className="fav overflow-x-scroll -mx-4 mt-4 md:max-w-full md:h-full p-4 lg:max-w-full flex gap-4 scrollable-courses">
          {courses
            .filter((course) => course.id === 1)
            .map((course) => (
              <Link key={course.id} to={`/sub?course=${course.name}`}>
                <Card b={course.name} />
              </Link>
            ))}
        </div>
      </div>
    </>
  )
)}

        {/* <div className='mx-12 '>
  <div className="bg-green-200 p-6 flex  items-center overflow-hidden">
    <div className='P-4 bg-green-200'>
      <h1 className='text-4xl font-bold'>Get 100% notes for free of cost</h1>
      <p className='text-2xl font-medium'>of any course : BCA, MSCIT, BSCIT</p>
    </div>
    <div className=' object-contain h-[400px]'><img src="https://www.tops-int.com/images/placement-banner-mob.jpg" alt="" /></div>
  </div>


</div> */}
        <p className="mt-4 text-sm font-bold">Select your course</p>
        <div className="grid grid-cols-2 p-4 lg:grid-cols-6 gap-4 mt-4">
          {courses.map((course) => (
            <Link key={course.id} to={`/sub?course=${course.name}`}>
              <Cbtn b={course.name} />
            </Link>
          ))}
        </div>
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