import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, Link} from 'react-router-dom';
import '../App.css';


const Sign = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate(); // hook for redirecting

  const handleClick = () => {
    navigate('/Login');
  };
  const handleSignUpClick = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('https://pixel-classes.onrender.com/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Signup successful:', data);
      // Redirect to another page or show a success message
      navigate('/dashboard'); // Example redirect
    } catch (error) {
      console.error('There was a problem with the signup request:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className=" p-6 w-full max-w-sm">
      <div className=" mb-6">
        <h1 className="text-2xl font-ff font-bold">Welcome to the,</h1>
        <div className="flex items-center justify-center mt-2">
        <Link to={'/'}>
          <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png" alt="Pixel Class logo" className="mr-2 w-full h-fit" />
          </Link>
         
        </div>
      </div>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium font-ff text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium font-ff text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium font-ff text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}  
            placeholder="Enter Password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium font-ff text-gray-700">Conformation Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.targetvalue)}
            placeholder="Enter Conformation Password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center justify-between">
          <button 
           onClick={handleClick}
           type="button" className="text-blue-600  hover:underline">
            I have an account 
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
                  Sign Up
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
          Sign Up with Google
        </button>
      </div>
    </div>
  </div>
  
  )
}

export default Sign
