import React, { useState, useEffect } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { useLocation, Link } from "react-router-dom"; 
import api from "../utils/api"; // axios with withCredentials:true
import '../new.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

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
        // Only check login if not on login page
        if (!window.location.pathname.includes("/auth/login")) return;

        const res = await api.get("/me/"); // proxy-ready
        if (res.data.username) {
          window.location.href = redirectTo;
        }
      } catch (err) {
        console.log("Not logged in");
      }
    };
    checkLogin();
  }, [redirectTo]);

  // Username/password login
  const logmein = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { username, password } = e.target;
      const res = await api.post("/user/login/", { // proxy-ready
        username: username.value,
        password: password.value
      });

      if (res.data.message === "Login successful!") {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1500);
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
      const res = await api.post("/user/google-login/", { token: credentialResponse.credential }); // proxy-ready
      if (res.data.message === "Login successful!") {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1500);
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
      <div className="bg-pattern"></div>

      <div className='ccf flex flex-col bg-[#000]/20' style={{ background: "radial-gradient(circle, rgb(10, 121, 45), #000)" }}>
        <div className='flex items-center flex-col min-h-screen justify-center p-6'>
          <div className="flex items-center justify-center mt-2 max-w-[360px]">
            <Link to={'/'}>
              <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png" alt="Pixel Class logo" className="mr-2 w-full h-full" />
            </Link>
          </div>

          <div className='px-4 py-6 flex flex-col bg-white border shadow-lg border-gray-200 max-w-[360px] w-full max-h-screen rounded-xl'>
            
            {error && <p className="text-red-600 font-bold m-2 text-md">{error}</p>}
            {success && <p className="text-green-600 text-center font-bold m-2 text-md">{success}</p>}

            {loading ? (
              <div className="flex justify-center">
                <div className="border-t-2 rounded-full border-gray-500 bg-gray-300 animate-spin aspect-square w-8 flex justify-center items-center text-yellow-700"></div>
              </div>
            ) : (
              <>
                {/* Google login */}
                <div className={`flex flex-col ${last === "Google" ? 'border border-green-500 p-2 rounded' : ''} gap-3 ${loading || success ? 'hidden' : ''}`}>
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

                <div className={`flex my-4 items-center gap-2 text-center text-gray-500 ${loading || success ? 'hidden' : ''}`}>
                  <span className='border-b-2 border-gray-200 flex-1'></span>
                  <div className='text-xs'>Or use username</div>
                  <span className='border-b-2 border-gray-200 flex-1'></span>
                </div>

                {/* Username/password login */}
                <form onSubmit={logmein} className={`flex flex-col ${last === "username" ? 'border border-green-500 p-2 rounded' : ''} gap-1 ${loading || success ? 'hidden' : ''}`}>
                  <span className={`${last === "username" ? "py-[2px] px-[5px] w-full text-green-600 max-w-max" : "hidden"} bg-green-300/30 text-[10px] border border-green-300 rounded`}>Last time used</span>
                  
                  <label htmlFor="username" className='text-sm font-semibold text-gray-900 mt-2'>Username</label>
                  <input type="text" name="username" id="username" className="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-gray-300 shadow-input" placeholder="Enter Username" />

                  <label htmlFor="password" className='text-sm font-semibold text-gray-900 mt-2'>Password</label>
                  <div className="relative">
                    <input type={passwordVisible ? "text" : "password"} name="password" id="password" className="w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-gray-300 shadow-input" placeholder="At least 8 characters." autoComplete="off" />
                    <button type="button" onClick={togglePasswordVisibility} className="absolute right-0 p-2 text-gray-500 hover:text-gray-900">
                      {passwordVisible ? "👁" : "🙈"}
                    </button>
                  </div>

                  <div className="flex justify-end mt-1">
                    <Link to="/auth/forgetpassword" className="text-blue-500 hover:text-blue-800 text-sm">Forget Password</Link>
                  </div>

                  <button type="submit" className="w-full mt-4 py-2 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all">Login</button>
                </form>
              </>
            )}
          </div>

          {!success && (
            <p className="mt-4 text-gray-400 text-sm text-center">
              Don't have a profile? <Link to="/auth/signup" className="text-gray-900 font-semibold hover:underline">Sign Up</Link>
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
