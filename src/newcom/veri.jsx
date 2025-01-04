import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Veri = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 300 seconds = 5 minutes
  const [expired, setExpired] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email and username from location state
  useEffect(() => {
    if (location.state && location.state.user) {
      setEmail(location.state.user.email);  // If passed as part of state
    }
  }, [location]);

  // Get username from cookies (can be used if necessary)
  const username = Cookies.get('username');  // This ensures username is available even on page reloads

  // Handle OTP input change
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    setOtp(prevOtp => [
      ...prevOtp.slice(0, index),
      element.value,
      ...prevOtp.slice(index + 1),
    ]);

    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  // Handle OTP form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      alert('Please enter a 6-digit OTP.');
      return;
    }

    if (!username) {
      alert('Username not found in cookies.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://pixel-classes.onrender.com/api/verify-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Verification successful!');
        navigate('/login');
      } else {
        alert(data.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting OTP:', error);
      alert('An error occurred while verifying. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function
  const handleResendOTP = async () => {
    setExpired(false);
    setTimer(300); // Reset timer to 5 minutes

    try {
      const response = await fetch('https://pixel-classes.onrender.com/api/resend-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('OTP has been resent to your email!');
      } else {
        alert(data.message || 'Failed to resend OTP.');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      alert('An error occurred while resending the OTP. Please try again.');
    }
  };

  // Timer countdown logic
  useEffect(() => {
    if (timer === 0) {
      setExpired(true); // OTP has expired
      return;
    }

    if (timer > 0 && !expired) {
      const intervalId = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);

      return () => clearInterval(intervalId); // Cleanup interval on component unmount or when timer reaches 0
    }
  }, [timer, expired]);

  // Format timer into minutes:seconds format
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">OTP Verification</h2>
      <p className="text-gray-600 mb-4 text-center">Enter the 6-digit code sent to your email</p>
      
      <div className="flex space-x-2 mb-6">
        {otp.map((data, index) => (
          <input
            className="w-14 h-14 text-center text-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            maxLength="1"
            key={index}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onFocus={(e) => e.target.select()}
            disabled={expired} // Disable inputs if OTP has expired
          />
        ))}
      </div>

      {/* Timer display */}
      <p className="text-gray-600 mb-4 text-center">
        Time remaining: {formatTime(timer)}
      </p>

      <div className="w-full flex justify-center space-x-4">
        {/* Submit button with conditional styling for disabled state */}
        <button
          className={`text-white px-6 py-2 rounded-md transition duration-200 ${
            loading || expired
              ? 'bg-gray-400 cursor-not-allowed'  // Gray background with disabled cursor
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          onClick={handleSubmit}
          disabled={loading || expired} // Disable the button if expired or loading
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>

        {/* Resend OTP button if OTP is expired */}
        {expired && (
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-200"
            onClick={handleResendOTP}
          >
            Resend OTP
          </button>
        )}
      </div>

      {/* Message when OTP expires */}
      {expired && (
        <div className="mt-4 text-center">
          <p className="text-red-500 mb-4">Your OTP has expired. Please request a new one.</p>
        </div>
      )}
    </div>
  );
};

export default Veri;