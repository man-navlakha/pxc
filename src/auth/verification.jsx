import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../new.css";

import api from "../utils/api"; // <-- Your axios instance

const Verification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sucsses, setSucsses] = useState(null);

  const [email, setEmail] = useState(Cookies.get("email"));
  const [username, setUsername] = useState(Cookies.get("username"));

  const navigate = useNavigate();
  const location = useLocation();

  const [otpCode, setOtpCode] = useState("");
  const [timer, setTimer] = useState(0); // 2 minutes
  const [expired, setExpired] = useState(false);

  // Get email from location if passed
  useEffect(() => {
    if (location.state && location.state.user) {
      setEmail(location.state.user.email);
    }
  }, [location]);

  // Handle OTP submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      alert("Please enter a 6-digit OTP.");
      return;
    }
    if (!username) {
      alert("Username not found in cookies.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.post(
        "user/verify-otp/",
        { username, otp: otpCode },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Server response:", response.data);
      alert("Verification successful!");

      if (response.data.message === "Login successful!") {
        Cookies.set("refresh_token", response.data.refresh_token, { expires: 7 });
        Cookies.set("username", username, { expires: 7 });

        setTimeout(() => {
          navigate("/", { replace: true });
        }, 200);
      } else {
        setError(response.data.message || "Unexpected response");
      }
    } catch (err) {
      console.error("Error submitting OTP:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setExpired(false);
    setOtpCode("");
    setTimer(3); // reset timer
    console.log(username)
    try {
      const response = await api.post(
        "user/resend-otp/",
        { username },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Resend OTP response:", response.data);
      setSucsses("OTP has been resent to your email.");
    } catch (err) {
      console.error("Error resending OTP:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to resend OTP.");
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timer === 0) {
      setExpired(true);
      return;
    }

    if (timer > 0 && !expired) {
      const intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [timer, expired]);

  // Format MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <>
      <div className="bg-pattern "></div>

      <div
        className="ccf flex flex-col bg-[#000]/20"
        style={{ background: "radial-gradient(circle, rgb(10, 121, 45), #000)" }}
      >
        <div className="flex items-center flex-col min-h-screen justify-center p-6">
          <div>
            <div className="flex items-center justify-center mt-2 max-w-[360px]">
              <Link to={"/"}>
                <img
                  src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png"
                  alt="Pixel Class logo"
                  className="mr-2 w-full h-full "
                />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center flex-col justify-center w-[360px] p-6">
              <div className="px-4 py-6 flex flex-col bg-white border shadow-lg border-gray-200 max-w-[360px] w-full max-h-screen rounded-xl">
                <div className="flex justify-center">
                  <div className="border-t-2 rounded-full border-gray-500 bg-gray-300 animate-spin aspect-square w-8 flex justify-center items-center text-yellow-700"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center flex-col justify-center w-[360px] p-6">
              <div className="px-4 py-6 flex flex-col bg-white border shadow-lg border-gray-200 max-w-[360px] w-full max-h-screen rounded-xl">
                {error && <p className="text-red-600 font-bold m-2 text-md">{error}</p>}
                {sucsses && <p className="text-green-600 text-center font-bold m-2 text-md">{sucsses}</p>}
                <h1 className="text-xl mb-2 font-bold">Verify yourself</h1>

                {expired && (
                  <div className="mt-4 text-center">
                    <p className="text-red-500 mb-4">
                      Your OTP has expired. Please request a new one.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <div>
                    <label htmlFor="otp" className="text-sm font-semibold text-gray-1k">
                      One Time Password (OTP)
                    </label>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-2 py-1.5 outline-none text-sm rounded-lg border max-h-8 transition-all duration-100 border-gray-200 bg-gray-00 text-gray-1k hover:border-gray-300 focus-within:border-gray-300 dark:bg-gray-50 shadow-input hover:shadow-input-hover focus-within:shadow-input"
                      id="otp"
                      placeholder="Enter OTP"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  type="submit"
                  className="w-full mt-6 justify-center flex items-center font-semibold border transition-all ease-in duration-75 whitespace-nowrap text-center select-none disabled:shadow-none disabled:opacity-50 text-white disabled:cursor-not-allowed gap-x-1 active:shadow-none text-base leading-[22px] rounded-2xl py-2 h-10 px-6 text-gray-00 bg-gray-900 border-gray-1k hover:bg-gray-1k disabled:bg-gray-900 dark:bg-gray-1k dark:border-gray-800 dark:hover:bg-gray-800 dark:disabled:bg-gray-800 shadow-10 hover:shadow-15 dark:shadow-10 dark:hover:shadow-10"
                >
                  {loading ? "Verifying..." : "Verify"}{" "}
                  <span className="-mr-1">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12H19.5833M19.5833 12L12.5833 5M19.5833 12L12.5833 19"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      ></path>
                    </svg>
                  </span>
                </button>

                {expired && (
                  <button
                    className="w-full mt-6 justify-center flex items-center font-semibold border transition-all ease-in duration-75 whitespace-nowrap text-center select-none disabled:shadow-none disabled:opacity-50 text-white disabled:cursor-not-allowed gap-x-1 active:shadow-none text-base leading-[22px] rounded-2xl py-2 h-10 px-6 text-gray-00 bg-blue-900 border-gray-1k hover:bg-blue-600 disabled:bg-gray-900 dark:bg-gray-1k dark:border-gray-800 dark:hover:bg-gray-800 dark:disabled:bg-gray-800 shadow-10 hover:shadow-15 dark:shadow-10 dark:hover:shadow-10"
                    onClick={handleResendOTP}
                  >
                    Resend OTP
                  </button>
                )}

                <p className="text-gray-600 font-normal text-xs my-3 text-center">
                  Time remaining: {formatTime(timer)}
                </p>
                <p className="text-gray-500 dark:text-gray-600 font-normal text-xs text-center">
                  The 6-digit code was sent to{" "}
                  <span className="text-gray-500 hover:text-gray-1k hover:underline font-semibold transition-all ease-in-out">
                    {email}
                  </span>{" "}
                  for account verification of{" "}
                  <span className="text-gray-500 hover:text-gray-1k hover:underline font-semibold transition-all ease-in-out">
                    {username}
                  </span>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Verification;
