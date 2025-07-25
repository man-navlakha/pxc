import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useLocation, Link } from "react-router-dom";
import '../new.css'

const Verification = () => {

  const username = Cookies.get("username");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState(Cookies.get("email"));
  const [sucsses, setSucsses] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  console.log("Username from cookies:", username);
  console.log("Email from cookies:", email);

  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(120); // 300 seconds = 5 minutes
  const [expired, setExpired] = useState(false);

  // Retrieve email and username from location state
  useEffect(() => {
    if (location.state && location.state.user) {
      setEmail(location.state.user.email);  // If passed as part of state
    }

    
  }, [location]);

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
      const response = await fetch('https://pixel-classes.onrender.com/api/user/verify-otp/', {
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

        console.log(data); // Log backend response for debugging

        if (data.message === "Login successful!") {
          // Save access_token and username to cookies
          Cookies.set('access_token', data.access_token, { expires: 7 }); // Expires in 7 days
          Cookies.set('username', username, { expires: 7 }); // Save username to cookies

          // Redirect to the home page after successful login
          navigate('/');
        } else {
          console.error("Login error:", data.message);
        }
      } else {
        alert(data.error);
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
    setTimer(120); // Reset timer to 2 minutes

    try {
      const response = await fetch('https://pixel-classes.onrender.com/api/user/resend-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('OTP has been resent to your email!');
      } else {
        console.error('Error resending OTP:', data.error);
      }
    } catch (error) {
      console.error('There was a problem with the resend OTP request:', error);
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
    <>
      <div className="bg-pattern "></div>

      <div className='ccf flex flex-col bg-[#000]/20' style={{ background: "radial-gradient(circle, rgb(10, 121, 45), #000)" }}>


        <div className='flex items-center flex-col  min-h-screen justify-center p-6'>
          <div>
            <div className="flex items-center justify-center mt-2 max-w-[360px]">
              <Link to={'/'}>
                <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png" alt="Pixel Class logo" className="mr-2 w-full h-full " />
              </Link>
            </div>
          </div>
          {loading ? '' :
            <div className='flex items-center flex-col justify-center  w-[360px] p-6'>
              <div className=' px-4 py-6 flex flex-col bg-white border shadow-lg border-gray-200 max-w-[360px] w-full max-h-screen rounded-xl '>

                {error && <p className="text-red-600 font-bold m-2 text-md">{error}</p>}
                {sucsses && <p className="text-green-600 text-center font-bold m-2 text-md">{sucsses}</p>}
                <h1 className="text-xl mb-2 font-bold">Verify your self</h1>

                {expired && (
                  <div className="mt-4 text-center">
                    <p className="text-red-500 mb-4">Your OTP has expired. Please request a new one.</p>
                  </div>
                )}

                <div className='flex flex-col gap-1'>
                  <div>

                    <label htmlFor="otp" className='text-sm font-semibold text-gray-1k'>One Time Password (OTP)</label>
                  </div>
                  <div>

                    <input
                      type="number"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      className="w-full px-2 py-1.5 outline-none text-sm rounded-lg border max-h-8 transition-all duration-100 border-gray-200 bg-gray-00 text-gray-1k hover:border-gray-300 focus-within:border-gray-300 dark:bg-gray-50 shadow-input hover:shadow-input-hover focus-within:shadow-input"
                      id="otp"
                      placeholder="Enter OTP"
                    />
                  </div>

                </div>

                <button onClick={handleSubmit} type="submit" className="w-full mt-6 justify-center  flex items-center font-semibold border transition-all ease-in duration-75 whitespace-nowrap text-center select-none disabled:shadow-none disabled:opacity-50 text-white disabled:cursor-not-allowed gap-x-1 active:shadow-none text-base leading-[22px] rounded-2xl py-2 h-10 px-6 text-gray-00 bg-gray-900 border-gray-1k hover:bg-gray-1k disabled:bg-gray-900 dark:bg-gray-1k dark:border-gray-800 dark:hover:bg-gray-800 dark:disabled:bg-gray-800 shadow-10 hover:shadow-15 dark:shadow-10 dark:hover:shadow-10">  {loading ? 'Verifying...' : 'Verify'} <span className="-mr-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19.5833M19.5833 12L12.5833 5M19.5833 12L12.5833 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></path></svg></span></button>
                {/* Resend OTP button if OTP is expired */}
                {expired && (
                  <button
                    className="w-full mt-6 justify-center  flex items-center font-semibold border transition-all ease-in duration-75 whitespace-nowrap text-center select-none disabled:shadow-none disabled:opacity-50 text-white disabled:cursor-not-allowed gap-x-1 active:shadow-none text-base leading-[22px] rounded-2xl py-2 h-10 px-6 text-gray-00 bg-blue-900 border-gray-1k hover:bg-blue-600 disabled:bg-gray-900 dark:bg-gray-1k dark:border-gray-800 dark:hover:bg-gray-800 dark:disabled:bg-gray-800 shadow-10 hover:shadow-15 dark:shadow-10 dark:hover:shadow-10"
                    onClick={handleResendOTP}
                  >
                    Resend OTP
                  </button>
                )}

                <p className="text-gray-600 font-normal text-xs  my-3 text-center">
                  Time remaining: {formatTime(timer)}
                </p>
                <p className="text-gray-500 dark:text-gray-600 font-normal text-xs  text-gray-500 text-center font-normal">
                  The 6-digit code sent to your email

                  <a className="text-gray-500 hover:text-gray-1k hover:underline font-semibold transition-all ease-in-out" > {email} </a>, For <a className="text-gray-500 hover:text-gray-1k hover:underline font-semibold transition-all ease-in-out">account verification</a> of <a className="text-gray-500 hover:text-gray-1k hover:underline font-semibold transition-all ease-in-out" >{username}</a>.</p>
              </div>
            </div>

          }


        </div>
      </div>
    </>
  )
}

export default Verification
