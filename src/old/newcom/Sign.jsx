import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, Link } from 'react-router-dom';
import axios from "axios"; 

const Sign = () => {
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  
    const [courses, setCourses] = useState([]); // State to store courses
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [course, setCourse] = useState('');
  const [loading, setLoading] = useState(false); // Define loading state
  const navigate = useNavigate(); // hook for redirecting
  const [passwordVisible, setPasswordVisible] = useState(false);


  
   // Handle google login

   const handleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('https://pixel-classes.onrender.com/api/user/google-signup/', {
        token: credentialResponse.credential,
      });
  
      if (res.data.message === "Sign Up Complete") {
        // ✅ Save tokens & username to cookies
        Cookies.set("access_token", res.data.access_token, { expires: 7 });
        Cookies.set("username", res.data.username || "Guest", { expires: 7 });
  
        setUsername(res.data.username?.toLowerCase() || "");
  
        // ✅ Redirect user to the previous page or default home
        setTimeout(() => {
          const redirectTo = new URLSearchParams(location.search).get("redirect") || "/";
          navigate(redirectTo, { replace: true });
        }, 100);
      } else {
        setError("Invalid login credentials.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  }; 

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
   useEffect(() => {
      
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

        const handleSignUpClick = async (e) => {
          e.preventDefault();
          
          setError(''); // Clear any previous error
        
          if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
          }
        
          // Basic email validation
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
          if (!emailRegex.test(email)) {
            alert('Please enter a valid email');
            return;
          }
        
          // Basic password validation
          if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
          }
        
        
          setLoading(true); // Start loading
        
          try {
            const response = await fetch('https://pixel-classes.onrender.com/api/user/register/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username, email, password, course }),
            });
        
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Network response was not ok');
            }
        
            const data = await response.json();
            console.log('Signup successful:', data);
            Cookies.set('username', username); // Save username to cookies
            Cookies.set('email', email); // Save email to cookies
            
            // Redirect to the /verification page and pass the username via state
            navigate('/verification', { state: { user: { username } } });
        
          } catch (error) {
            console.error('There was a problem with the signup request:', error);
            setError(error.message);
            setLoading(false); // End loading
          } finally {
            // Any cleanup code if necessary
            setLoading(false); // End loading
          }
        };

  const handleClick = () => {
    navigate('/login');
  };

  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#1e1e1e] dark:text-white">
      <div className="p-6 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-2xl title-home font-bold">Welcome to the,</h1>
          <div className="flex items-center justify-center mt-2">
            <Link to={'/'}>
              <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png" alt="Pixel Class logo" className="mr-2 w-full h-full" />
            </Link>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSignUpClick}>
        {error && <p className="error-message font-bold text-red-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium title-home text-gray-700 dark:text-gray-100 ">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
              placeholder="Enter username"
              required
              className="dark:text-gray-100 dark:bg-[#383838] mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium title-home-home text-gray-700 dark:text-gray-100 ">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              placeholder="Enter email"
              required
              className="dark:text-gray-100 dark:bg-[#383838] mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium title-home-home text-gray-700 dark:text-gray-100 ">Password</label>
              <div className="flex item-center">
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
                className="dark:text-gray-100 dark:bg-[#383838] mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
               <button className="-ml-8 drop-shadow drop-shadow-lg rounded-lg " type="button" onClick={togglePasswordVisibility} >
              {passwordVisible ? '🔒' : '👁️'}
            </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium title-home-home text-gray-700 dark:text-gray-100 ">Confirm Password</label>
            <div className="flex item-center">
            <input
              type={passwordVisible ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Enter Confirm Password"
              required
              className="dark:text-gray-100 dark:bg-[#383838] mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
          </div>
          <div>
  <label className="block text-sm font-medium title-home text-gray-700 dark:text-gray-100">Select Your Course:</label>
  <select
    required
    className="dark:text-gray-100 dark:bg-[#383838] mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
    value={course}
    onChange={(e) => setCourse(e.target.value)}
  >
    <option
      className="dark:text-gray-100 dark:bg-[#383838] mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
      value=""
      disabled
    >
      Select Your Course
    </option>
    {courses.map((course) => (
      <option key={course.id} value={course.name}>
        {course.name}
      </option>
    ))}
  </select>
</div>
          <div className="flex items-center justify-between">
            <button 
              onClick={handleClick}
              type="button" className="text-blue-800 dark:text-blue-500  hover:underline">
              I have an account 
            </button>
            <button
              type="submit"
              className="w-lg flex items-center px-4 py-2 bg-green-700 text-white title-home rounded-md hover:bg-green-800"
              disabled={loading} // Disable button when loading
            >
              {loading ? ( <div className="s-loading"></div>) : ("Sign Up")}
            </button>
          </div>
        </form>
        <div className="mt-[76px]">
          {/* <button
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <img src="https://ik.imagekit.io/pxc/g-logo.png" alt="Google logo" className="mr-2 h-6 w-6" />
            Sign Up with Google
          </button> */}
        </div>

        <div className="mt-6">
            <p className="text-emerald-600 text-center m-2">I have an account?</p>
            <button 
              onClick={handleClick}
              className="title-home w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm hover:text-md font-medium text-white hover:text-gray-700 bg-emerald-900 hover:bg-emerald-50 dark:hover:bg-[#383838] dark:hover:text-gray-200"
            >
             Login 
            </button>
          </div>
      </div>
    </div>
      {/* <Footer /> */}
      </>
  );
};

export default Sign;
