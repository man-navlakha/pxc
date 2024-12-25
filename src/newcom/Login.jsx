import React, { useState } from "react"; 
import axios from "axios";
import Cookies from "js-cookie";
import '../App.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const navigate = useNavigate(); // hook for redirecting

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error
  
    try {
      const response = await axios.post("http://localhost:5000/login", credentials, {
        headers: { "Content-Type": "application/json" },
      });
  
      if (response.data.message === "Login successful") {
        Cookies.set("authToken", "your-token-here", { expires: 7 });
        navigate('/');
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err); // Log the error to see the full response
      setError("An error occurred. Please try again later.");
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome back to,</h1>
          <div className="flex items-center justify-center mt-2">
            <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png" alt="Pixel Class logo" className="mr-2 w-full h-fit" />
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}> {/* Form submit handler */}
          {error && <p className="error-message">{error}</p>}

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
              type="submit" // Correcting this to trigger form submission
              className="flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
            >
              Log in
              <i className="fas fa-arrow-right ml-2"></i>
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
      </div>
    </div>
  );
}

export default Login;
