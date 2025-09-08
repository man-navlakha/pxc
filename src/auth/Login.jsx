import React, { useState, useEffect } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../utils/api"; // centralized axios with withCredentials:true
import '../new.css'

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const last = "username";
  const redirectTo = new URLSearchParams(location.search).get("redirect") || "/";

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Check if already logged in
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await api.get("/me/");
        if (res.data.user) {
          navigate(redirectTo, { replace: true });
        }
      } catch (err) {
        console.log("Not logged in");
      }
    };
    checkLogin();
  }, [navigate, redirectTo]);

  // Username/password login
  const logmein = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { username, password } = e.target;
      const res = await api.post("/user/login/", {
        username: username.value,
        password: password.value
      });

      if (res.data.message === "Login successful!") {
        setSuccess("Login successful!");
        setTimeout(() => navigate(redirectTo, { replace: true }), 3000);
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const googleLogin = async (credentialResponse) => {
    if (!credentialResponse?.credential) return setError("Google credential missing");
    setLoading(true);
    try {
      const res = await api.post("/user/google-login/", {
        token: credentialResponse.credential
      });
      if (res.data.message === "Login successful!") {
        setSuccess("Login successful!");
        setTimeout(() => navigate(redirectTo, { replace: true }), 3000);
      } else {
        setError("Google login failed");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Google login error");
    } finally {
      setLoading(false);
    }
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
                    <div className=' px-4 py-6 flex flex-col bg-white border shadow-lg border-gray-200 max-w-[360px] w-full max-h-screen rounded-xl '>


                        {error && (
                            <p className="text-red-600 font-bold m-2 text-md">
                                {typeof error === "string" ? error : JSON.stringify(error)}
                            </p>
                        )}
                        {success && (
                            <p className="text-green-600 text-center font-bold m-2 text-md">
                                {typeof success === "string" ? success : JSON.stringify(success)}
                            </p>
                        )}

                        {loading ? <div className="flex justify-center">
                            <div className=" border-t-2 rounded-full border-gray-500 bg-gray-300 animate-spin
aspect-square w-8 flex justify-center items-center text-yellow-700"></div>
                        </div> :


                            <>
                                <div className={`flex flex-col ${last === "Google" ? 'border border-green-500 p-2 rounded' : ''} gap-3 ${loading ? 'hidden' : ''}`}>

                                    <span className={`${last === "Google" ? "py-[2px] px-[5px] w-full text-green-600 max-w-max" : "hidden"} bg-green-300/30 text-[10px] border border-green-300 rounded`}>Last time used</span>

                                    {typeof window !== "undefined" && (
                                        <GoogleLogin
                                            onSuccess={googleLogin}
                                            onError={() => console.log('Login Failed')}
                                            auto_select
                                            context="signin"
                                        />
                                    )}

                                </div>



                                <div className='flex my-4 items-center gap-2 text-center text-gray-500 '>
                                    <span className='border-b-2 border-gray-200 flex-1'></span>
                                    <div className='text-xs'>Or use username</div>
                                    <span className='border-b-2 border-gray-200 flex-1'></span>
                                </div>



                                <div>

                                    <form onSubmit={logmein} className={`flex flex-col ${last === "username" ? 'border border-green-500 p-2 rounded' : ''} gap-1 ${loading ? 'hidden' : ''}`}>
                                        {/* {last === "username" ? "Last Used" : ""} */}
                                        <span className={`${last === "username" ? "py-[2px] px-[5px] w-full text-green-600 max-w-max" : "hidden"} bg-green-300/30 text-[10px] border border-green-300 rounded`}>Last time used</span>
                                        <div className='flex flex-col gap-1'>
                                            <div>

                                                <label htmlFor="username" className='text-sm font-semibold text-gray-900'>username</label>
                                            </div>
                                            <div>

                                                <input type="text"
                                                    onChange={(e) => e.target.value = e.target.value}
                                                     name="username"
                                                      id="username"
                                                    className="w-full px-2 py-1.5 outline-none text-sm rounded-lg border max-h-8 transition-all duration-3000 border-gray-200 bg-white text-gray-900 hover:border-gray-300 focus-within:border-gray-300 dark:bg-gray-50 shadow-input hover:shadow-input-hover focus-within:shadow-input   "
                                                    placeholder="Enter Username" />
                                            </div>

                                        </div>
                                        <div className='flex flex-col gap-1'>
                                            <div>

                                                <label htmlFor="password" className='text-sm font-semibold text-gray-900'>Password</label>
                                            </div>
                                            <div className="relative">
                                                <input
                                                type={passwordVisible ? "text" : "password"}
                                                className="w-full px-2 py-1.5 outline-none text-sm rounded-lg border max-h-8 transition-all duration-3000 border-gray-200 bg-white text-gray-900 hover:border-gray-300 focus-within:border-gray-300 dark:bg-gray-50 shadow-input hover:shadow-input-hover focus-within:shadow-input   "
                                                id="password"
                                                name="password"
                                                placeholder="At least 8 characters."
                                                autoComplete="off"
                                                aria-autocomplete="list"
                                                data-rr-is-password="true" />
                                                <button onClick={togglePasswordVisibility} type="button" aria-label="view-password" className="absolute right-0 p-2 text-gray-500 cursor-pointer hover:text-gray-900">
                                                    {passwordVisible ?
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12.85c3.6-7.8 14.4-7.8 18 0m-9 4.2a2.4 2.4 0 110-4.801 2.4 2.4 0 010 4.801z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></path></svg>
                                                        :
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7c3.6 7.8 14.4 7.8 18 0m-3.22 3.982L21 15.4m-9-2.55v4.35m-5.78-6.218L3 15.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></path></svg>
                                                    }
                                                </button></div>

                                        </div>
                                        <div className="flex items-center justify-end">
                                            {/* <span className="mx-1 text-blue-500 hover:text-blue-800 hover:font-bold">d</span> */}
                                            <span className="mx-1 text-blue-500 hover:text-blue-800 hover:font-bold"><a href=" /auth/forgetpassword">Forget Password</a></span>
                                        </div>

                                        <button type="submit" className="w-full mt-6 justify-center  flex items-center font-semibold border transition-all ease-in duration-75 whitespace-nowrap text-center select-none disabled:shadow-none disabled:opacity-50 text-white disabled:cursor-not-allowed gap-x-1 active:shadow-none text-base leading-[22px] rounded-2xl py-2 h-10 px-6 text-white bg-gray-900 border-gray-1k hover:bg-gray-1k disabled:bg-gray-900 dark:bg-gray-1k dark:border-gray-800 dark:hover:bg-gray-800 dark:disabled:bg-gray-800 shadow-10 hover:shadow-15 dark:shadow-10 dark:hover:shadow-10">Login <span className="-mr-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19.5833M19.5833 12L12.5833 5M19.5833 12L12.5833 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"></path></svg></span></button>

                                    </form>
                                </div>
                            </>
                        }
                    </div>

                    <p className="mt-4 text-gray-400 dark:text-gray-900 font-normal text-sm text-center">Don't have a profile? <a className="text-gray-300 hover:text-gray-900 hover:underline font-semibold transition-all ease-in-out" href=" /auth/signup">Sign Up</a></p>
                </div>




            </div>
        </>
    )
}

export default Login;