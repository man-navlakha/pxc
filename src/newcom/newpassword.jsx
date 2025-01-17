import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

import { useNavigate, useLocation, Link } from 'react-router-dom';

const NewPassword = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get query parameters from URL
  const params = new URLSearchParams(location.search);
  // const userId = params.get("id"); // Use 'id' if that's what Django is sending
  const userId =  Cookies.get('user_id'); 
  const token = Cookies.get('token'); // Get token from cookies
  // If userId is not found, handle error gracefully
  useEffect(() => {
    if (!userId) {
      setError("Invalid or expired link. Please try again.");
    }
  }, [userId]);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://pixel-classes.onrender.com/api/submit-new-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId, // Pass user_id to the API
          new_password: password,
        }),
      });

      const text = await response.text();  // Get the raw response as text
      console.log(text);  // Log the response to check if it's HTML

      if (response.ok) {
        const data = JSON.parse(text);  // Try parsing the JSON if the response is valid
        // On success, redirect to login page
        navigate('/login');

             
  // Set a cookie
  Cookies.set('user_id', user_id, { expires: 7 }); // Cookie expires in 7 days
      } else {
        setError(text);  // Show the error text if it's not valid JSON
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-ff font-bold text-center">Set your new password</h1>
          <div className="flex items-center justify-center mt-2">
            <Link to={'/'}>
              <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png" alt="Pixel Class logo" className="mr-2 w-full h-fit" />
            </Link>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Password Input */}
          <div>
            <label className="font-ff block text-sm font-medium text-gray-700">Enter password</label>
            <input
              type="password"
              name="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your new password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="font-ff block text-sm font-medium text-gray-700">Re-enter password</label>
            <input
              type="password"
              name="cpassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Re-enter your new password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <button type="button" className="text-blue-600 hover:underline" onClick={handleLogin}>
              Log in
            </button>
            <button
              type="submit"
              className="w-lg flex items-center px-4 py-2 bg-green-700 text-white font-ff rounded-md hover:bg-green-800"
              disabled={loading}
            >
              {loading ? (
                <div className="loader"></div> // Loading spinner
              ) : (
                <>
                  Set Password
                  <i className="fas fa-arrow-right ml-2"></i>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPassword;
