import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleLogin } from '@react-oauth/google';
import Cookies from "js-cookie";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../App.css";

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(Cookies.get("username") || "");
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Fix: Ensure `location` is available


   // Handle google login

 const handleLoginSuccess = async (credentialResponse) => {
  try {
    const res = await axios.post('https://pixel-classes.onrender.com/api/user/google-login', {
      token: credentialResponse.credential,
    });
    console.log(res.data);
    // Save user info or token to localStorage if needed
  } catch (error) {
    console.error('Login failed:', error);
  }

}
  // ✅ Handle redirection if user is already logged in
  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      setTimeout(() => {
        navigate(location?.state?.from || "/", { replace: true });
      }, 100);
    }
  }, [navigate, location]); // ✅ Fix: Added location dependency

  // ✅ Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };






  // ✅ Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://pixel-classes.onrender.com/api/user/login/",
        {
          username: e.target.username.value.toLowerCase(),
          password: e.target.password.value,
        }
      );

      console.log(response.data); // Debugging log

      if (response.data.message === "Login successful!") {
        // ✅ Save tokens & username to cookies
        Cookies.set("access_token", response.data.access_token, { expires: 7 });
        Cookies.set("username", e.target.username.value, { expires: 7 });

        setUsername(e.target.username.value.toLowerCase()); // ✅ Update username state

        // ✅ Redirect user to the previous page or default home
        setTimeout(() => {
          const redirectTo = new URLSearchParams(location.search).get("redirect") || "/";
        navigate(redirectTo, { replace: true });
        }, 100);
      } else {
        setError("Invalid login credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(err.response?.data?.error || "An error occurred"); // ✅ Fix: Prevent crash if error response is missing
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#1e1e1e] dark:text-white">
      <div className="p-6 w-full max-w-sm">
      <div className="mb-6">
          <h1 className="text-2xl title-home font-bold">Welcome back, {username || 'to'}</h1>
          <div className="flex items-center justify-center mt-2">
            <Link to={'/'}>
              <img src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png" alt="Pixel Class logo" className="mr-2 w-full h-full " />
            </Link>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          {error && <p className="text-red-600 font-bold">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
              Username
            </label>
            <input
              type="text"
              name="username"
              className="dark:text-gray-100 dark:bg-[#383838] mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              onChange={(e) => e.target.value = e.target.value.toLowerCase()}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
              Password
            </label>
            <div className="flex items-center">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                className="dark:text-gray-100 dark:bg-[#383838] mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                required
              />
              <button
                type="button"
                className="-ml-8 rounded-lg"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? "🔒" : "👁️"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => navigate("/fgpassword")}
            >
              I want new password
            </button>
            <button
              type="submit"
              className="w-lg flex items-center px-4 py-2 bg-green-700 text-white title-home rounded-md hover:bg-green-800"
              disabled={loading}
            >
              {loading ? <div className="s-loading"></div> : "Log in"}
            </button>
          </div>
        </form>
        <div>
      <h2>Login</h2>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => console.log('Login Failed')}
      />
    </div>
        <div className="mt-6 text-center">
          <p className="text-emerald-600">Don't have an account?</p>
          <button
            onClick={() => navigate("/signup")}
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-emerald-900 hover:bg-emerald-50 dark:hover:bg-[#383838] dark:hover:text-gray-200"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
