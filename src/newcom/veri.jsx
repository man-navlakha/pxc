import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Veri = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email from location state passed during navigation
  useEffect(() => {
    if (location.state && location.state.user) {
      setEmail(location.state.user.email);  // Assuming email was passed in state
    }
  }, [location]);

  // Handle OTP change
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    // Update OTP value at the correct index
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input field
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  // Submit OTP to the API
  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpCode = otp.join('');  // Join OTP array into a string
    if (otpCode.length !== 6) {
      alert('Please enter a 6-digit OTP.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://pixel-classes.onrender.com/api/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Verification successful!');
        // Redirect user to login page after successful verification
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">OTP Verification</h2>
      <p className="text-gray-600 mb-4">Enter the 6-digit code sent to your email</p>
      <div className="flex space-x-2 mb-6">
        {otp.map((data, index) => (
          <input
            className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            name="otp"
            maxLength="1"
            key={index}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
      <button
        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-200"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Verifying...' : 'Verify'}
      </button>
    </div>
  );
};

export default Veri;
