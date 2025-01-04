import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(Cookies.get('username') || ''); // Get username from cookies or default to ''
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      navigate('/'); // Redirect to home if already logged in
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://pixel-classes.onrender.com/api/login/', {
        username: e.target.username.value,
        password: e.target.password.value,
      });

      console.log(response.data); // Log backend response for debugging

      if (response.data.message === "Login successful!") {
        // Save access_token and username to cookies
        Cookies.set('access_token', response.data.access_token, { expires: 7 }); // Expires in 7 days
        Cookies.set('username', e.target.username.value, { expires: 7 }); // Save username to cookies

        setUsername(e.target.username.value); // Update username state

        // Redirect to the home page after successful login
        navigate('/');
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err); // Log the error to see the full response

      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        switch (err.response.status) {
          case 400:
            setError("Invalid input data. Please check your input and try again.");
            break;
          case 404:
            setError("Resource not found. The requested resource does not exist.");
            break;
          case 401:
            setError("Username either password is wrong.");
            break;
          case 403:
            setError("Password is wrong.");
            break;
          case 409:
            setError("Resource conflict. There is a conflict with the current state of the resource.");
            break;
          case 500:
            setError("An unexpected error occurred. Please try again later.");
            break;
          case 502:
            setError("Bad Gateway. Please try again later.");
            break;
          case 503:
            setError("Service temporarily unavailable. Please try again later.");
            break;
          default:
            setError(`Error: ${err.response.status}. Please try again later.`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError("No response from server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleSubmit = (e) => {
    handleLogin(e);
  };

  // Check if the user is logged in by seeing if the token exists in cookies
  const token = Cookies.get('access_token');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-ff font-bold">Welcome back, {username || 'to'}</h1>
          <div className="flex items-center justify-center mt-2">
            <Link to={'/'}>
              <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png" alt="Pixel Class logo" className="mr-2 w-full h-fit" />
            </Link>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="error-message font-bold text-red-600">{error}</p>}

          <div>
            <label className="font-ff block text-sm font-medium text-gray-700">Username</label>
            <input type="text" name="username" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
          </div>

          <div>
            <label className="font-ff block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
          </div>

          <div className="flex items-center justify-between">
            <button type="button" className="text-blue-600 hover:underline">
              I want new password
            </button>
            <button
              type="submit"
              className="w-lg flex items-center px-4 py-2 bg-green-700 text-white font-ff rounded-md hover:bg-green-800"
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

        {!token && (
          <div className="mt-6">
            <button
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <img src="https://ik.imagekit.io/pxc/g-logo.png" alt="Google logo" className="mr-2 h-6 w-6" />
              Sign in with Google
            </button>
          </div>
        )}

        {!token && (
          <div className="mt-6">
            <p className="text-emerald-600 text-center m-2">Don't have an account?</p>
            <button 
              onClick={handleSignUpClick}
              className="font-ff w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm hover:text-md font-medium text-white hover:text-gray-700 bg-emerald-900 hover:bg-emerald-50"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
