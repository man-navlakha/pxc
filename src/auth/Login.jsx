import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useLocation, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../new.css";

const Login = () => {
  const [loading, setLoading] = useState(true); // start loading until we probe
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = new URLSearchParams(location.search).get("redirect") || "/";

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  // --- Probe /me/ to check if already logged in ---
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await api.get("/me/"); // allow refresh in interceptor
        if (res.data?.username) {
          console.info("[Login] already logged in -> redirecting to", redirectTo);
          navigate(redirectTo, { replace: true });
          return;
        }
      } catch (err) {
        console.log("[Login] User not logged in (probe 401). Stay on login page.");
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, [navigate, redirectTo]);

  // --- Handle username/password login ---
  const logmein = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { username, password } = e.target;
      const res = await api.post("/user/login/", {
        username: username.value,
        password: password.value,
      });

      if (res.data?.message === "Login successful!") {
        setSuccess("Login successful! Redirecting...");
        // Check /me/ again so we know user context is valid
        await api.get("/me/");
        navigate(redirectTo, { replace: true });
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error("[Login] error:", err);
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Google login ---
  const googleLogin = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      return setError("Google credential missing");
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/user/google-login/", {
        token: credentialResponse.credential,
      });

      if (res.data?.message === "Login successful!") {
        setSuccess("Login successful! Redirecting...");
        await api.get("/me/");
        navigate(redirectTo, { replace: true });
      } else {
        setError("Google login failed");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Google login error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-400">
        Checking session...
      </div>
    );
  }

  return (
    <>
      <div className="bg-pattern"></div>

      <div
        className="ccf flex flex-col bg-[#000]/20"
        style={{ background: "radial-gradient(circle, rgb(10, 121, 45), #000)" }}
      >
        <div className="flex items-center flex-col min-h-screen justify-center p-6">
          {/* Logo */}
          <div className="flex items-center justify-center mt-2 max-w-[360px]">
            <Link to={"/"}>
              <img
                src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png"
                alt="Pixel Class logo"
                className="mr-2 w-full h-full"
              />
            </Link>
          </div>

          {/* Login card */}
          <div className="px-4 py-6 flex flex-col bg-white border shadow-lg border-gray-200 max-w-[360px] w-full rounded-xl">
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

            {loading ? (
              <div className="flex justify-center">
                <div className="border-t-2 rounded-full border-gray-500 bg-gray-300 animate-spin aspect-square w-8"></div>
              </div>
            ) : (
              <>
                {/* Google Login */}
                <div className="flex flex-col gap-3 mb-4">
                  {typeof window !== "undefined" && (
                    <GoogleLogin
                      onSuccess={googleLogin}
                      onError={() => setError("Google login failed")}
                      context="signin"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 text-center text-gray-500">
                  <span className="border-b-2 border-gray-200 flex-1"></span>
                  <div className="text-xs">Or use username</div>
                  <span className="border-b-2 border-gray-200 flex-1"></span>
                </div>

                {/* Username/password form */}
                <form onSubmit={logmein} className="flex flex-col gap-2 mt-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="username" className="text-sm font-semibold text-gray-900">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 hover:border-gray-300 focus:border-gray-300 shadow-input"
                      placeholder="Enter Username"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="password" className="text-sm font-semibold text-gray-900">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 hover:border-gray-300 focus:border-gray-300 shadow-input"
                        id="password"
                        name="password"
                        placeholder="At least 8 characters"
                        autoComplete="off"
                        required
                      />
                      <button
                        onClick={togglePasswordVisibility}
                        type="button"
                        aria-label="view-password"
                        className="absolute right-0 p-2 text-gray-500 hover:text-gray-900"
                      >
                        {passwordVisible ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <a
                      href="/auth/forgetpassword"
                      className="mx-1 text-blue-500 hover:text-blue-800 hover:font-bold text-sm"
                    >
                      Forget Password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 flex items-center justify-center font-semibold text-white rounded-2xl py-2 h-10 px-6 bg-gray-900 hover:bg-gray-800 shadow-10 hover:shadow-15"
                  >
                    Login →
                  </button>
                </form>
              </>
            )}
          </div>

          {!success && (
            <p className="mt-4 text-gray-400 text-sm text-center">
              Don’t have a profile?{" "}
              <a
                className="text-gray-300 hover:text-gray-900 hover:underline font-semibold"
                href="/auth/signup"
              >
                Sign Up
              </a>
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
