import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import LastF from './LastF';
import Card from './Card';
import Cbtn from './Cbtn';
import Cookies from 'js-cookie'; // Importing js-cookie library
import '../index.css'; // Import css file
import Footer from './Footer';

const Home = () => {
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Retrieve the 'username' cookie value
    const storedUserName = Cookies.get('username');
    console.log('Retrieved userName from cookie:', storedUserName); // Log the cookie value

    if (storedUserName && storedUserName !== 'undefined') {
      setUserName(storedUserName); // Set the username from cookie
      setIsLoggedIn(true); // Mark the user as logged in
    } else {
      setUserName('Guest'); // Default name if cookie is not found
      setIsLoggedIn(false); // Mark the user as not logged in
    }
  }, []);

  const handleLogout = () => {
    // Remove the username and access_token cookies to log the user out
    Cookies.remove('username');
    Cookies.remove('access_token');
    
    setUserName('Guest'); // Reset the username to 'Guest'
    setIsLoggedIn(false); // Update the login state to logged out

    // Refresh the page after logout
    window.location.reload(); // Reload the page to reset the UI and state
  };

  const courses = ['BCA', 'MSCIT', 'BBA', 'BCIT', 'BCOM', 'Nursing', 'B.Tech']; // Array of courses

  return (
    <div className="flex relative flex-col w-full min-h-screen bg-white">
      <Navbar className="sticky top-0 " />

      <div className="text-left w-full mb:max-w-mb lg:max-w-full p-4">
        <p className="text-lg">Welcome,</p>
        <h1 className="text-3xl font-ff font-bold text-emerald-700">
          {userName}
        </h1>

      

        <p className="mt-4 text-sm font-bold">Favorite Course</p>
        <div className="fav overflow-x-scroll -mx-4 mt-4 md:max-w-full md:h-full p-4 lg:max-w-full flex gap-4 scrollable-courses">
          {courses.map((course, index) => (
            <Link key={index} to={`/sub?course=${course}`}>
              <Card b={course} />
            </Link>
          ))}
        </div>

        <p className="mt-4 text-sm font-bold">Select your course</p>
        <div className="grid grid-cols-2 p-4 lg:grid-cols-6 gap-4 mt-4">
          {courses.map((course, index) => (
            <Link key={index} to={`/sub?course=${course}`}>
              <Cbtn b={course} />
            </Link>
          ))}
        </div>
      </div>
      <div className="lg:hidden md:block block">
      <LastF />
        
      </div>
      <div className="">
        
      <Footer />
      </div>
    </div>
  );
};

export default Home;
