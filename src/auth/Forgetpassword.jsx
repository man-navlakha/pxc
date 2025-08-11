import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../new.css';

const Forgetpassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate();
  const pollingInterval = useRef(null);

  // Handle form submission for password reset email
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("https://pixel-classes.onrender.com/api/user/password_reset/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccessMessage("A password reset email has been sent. Please check your inbox.");
        setIsEmailSent(true);
        setEmail(""); // Clear the email input field
        startPolling(email); // Start polling for reset status
      } else {
        const data = await response.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      if (err.name === "TypeError") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Start polling for reset status
  const startPolling = (emailToPoll) => {
    pollingInterval.current = setInterval(async () => {
      try {
        const response = await fetch("https://pixel-classes.onrender.com/api/user/reset/status/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: emailToPoll }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.is_reset) {
            clearInterval(pollingInterval.current); // Stop polling
            navigate("/Login"); // Redirect to login page
          }
        } else {
          console.error("Failed to fetch reset status");
        }
      } catch (err) {
        console.error("Error while polling:", err);
      }
    }, 5000); // Poll every 5 seconds
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

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
          {loading ?  <div className='flex items-center flex-col justify-center w-[360px] p-6'>
              <div className=' px-4 py-6 flex flex-col bg-white border shadow-lg border-gray-200 max-w-[360px] w-full max-h-screen rounded-xl '> <div className="flex justify-center">
                            <div className=" border-t-2 rounded-full border-gray-500 bg-gray-300 animate-spin
aspect-square w-8 flex justify-center items-center text-yellow-700"></div>
                        </div> 
                        </div> 
                        </div> 
                        :
            <div className='flex items-center flex-col justify-center w-[360px] p-6'>
              <div className=' px-4 py-6 flex flex-col bg-white border shadow-lg border-gray-200 max-w-[360px] w-full max-h-screen rounded-xl '>
                {error && <p className="text-red-600 font-bold m-2 text-md">{error}</p>}
                {successMessage && <p className="text-green-600 text-center font-bold m-2 text-md">{successMessage}</p>}
                <h1 className="text-xl mb-3 font-bold">Forget your password</h1>
                <div>
                  <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${loading ? 'hidden' : ''}`}>
                    <div className='flex flex-col gap-1'>
                      <div>
                        <label htmlFor="email" className='text-sm font-semibold text-gray-1k'>Email</label>
                      </div>
                      <div>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full px-2 py-1.5 outline-none text-sm rounded-lg border max-h-8 transition-all duration-100 border-gray-200 bg-gray-00 text-gray-1k hover:border-gray-300 focus-within:border-gray-300 dark:bg-gray-50 shadow-input hover:shadow-input-hover focus-within:shadow-input"
                          required
                          disabled={isEmailSent}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full mt-6 justify-center flex items-center font-semibold border transition-all ease-in duration-75 whitespace-nowrap text-center select-none disabled:shadow-none disabled:opacity-50 text-white disabled:cursor-not-allowed gap-x-1 active:shadow-none text-base leading-[22px] rounded-2xl py-2 h-10 px-6 text-gray-00 bg-gray-900 border-gray-1k hover:bg-gray-1k disabled:bg-gray-900 dark:bg-gray-1k dark:border-gray-800 dark:hover:bg-gray-800 dark:disabled:bg-gray-800 shadow-10 hover:shadow-15 dark:shadow-10 dark:hover:shadow-10"
                      disabled={loading || isEmailSent}
                    >
                      Send Email <span className="-mr-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19.5833M19.5833 12L12.5833 5M19.5833 12L12.5833 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></path></svg></span>
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-4 text-gray-400 dark:text-gray-600 font-normal text-sm text-center">I don't want to Forget?  <a className="text-gray-300 hover:text-gray-1k hover:underline font-semibold transition-all ease-in-out" href=" /auth/login">Log in</a></p>
            </div>
          }
        </div>
      </div>
    </>
  );
};

export default Forgetpassword;