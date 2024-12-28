import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, Link} from 'react-router-dom';
import '../App.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate(); // hook for redirecting

  // Check if the user is already logged in (status cookie is true)
  useEffect(() => {
    const statusCookie = Cookies.get('status');
    if (statusCookie === 'true') {
      // If the user is already logged in, redirect to the home page
      navigate('/');
    }
  }, [navigate]); // This runs once when the component is mounted

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error
    setLoading(true); // Start loading

    try {
      const response = await axios.post("https://pixel-classes.onrender.com/api/login/", credentials, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // Ensure cookies are sent/received
      });

      console.log(response.data); // Log backend response for debugging

      if (response.data.message === "Login successful!") {
        // Redirect to the home page after successful login
        navigate('/');
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err); // Log the error to see the full response
      setError("An error occurred. Please try again later. either recheck username or password");
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-ff font-bold">Welcome back to,</h1>
          <div className="flex items-center justify-center mt-2">
          <Link to={'/'}>
            <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png" alt="Pixel Class logo" className="mr-2 w-full h-fit" />
            </Link>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="error-message font-bold text-red-600">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button type="button" className="text-blue-600 hover:underline">
              I want new password
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
              disabled={loading} // Disable button while loading
            >
              {loading ? (
                <div className="loader"></div> // Loading spinner
              ) : (
                <>
                  Log in
                  <i className="fas fa-arrow-right ml-2"></i>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <button
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <img src="https://ik.imagekit.io/pxc/g-logo.png" alt="Google logo" className="mr-2 h-6 w-6" />
            Sign in with Google
          </button>
        </div>
        <div className="mt-6">
            <p className="text-emerald-600 text-center m-2">Don't have an account?</p>
          <button 
           onClick={handleSignUpClick}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm hover:text-md font-medium text-white hover:text-gray-700 bg-emerald-900 hover:bg-emerald-50"
          >
           Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;