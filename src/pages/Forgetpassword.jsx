import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Forgetpassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate();

  let pollingInterval = null; // To store the polling interval ID

  // Redirect to login page
  const handleLogin = () => {
    navigate("/Login");
  };

  // Handle form submission for password reset email
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("https://pixel-classes.onrender.com/api/password_reset/", {
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
        startPolling(); // Start polling for reset status
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
  const startPolling = () => {
    pollingInterval = setInterval(async () => {
      try {
        const response = await fetch("https://pixel-classes.onrender.com/api/reset/status/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }), // Send email in the request body
        });

        if (response.ok) {
          const data = await response.json();
          if (data.is_reset) {
            clearInterval(pollingInterval); // Stop polling
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
  React.useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-ff font-bold text-center">Forgot your password?</h1>
          <div className="flex items-center justify-center mt-2">
            <Link to={"/"}>
              <img
                src="https://ik.imagekit.io/pxc/pixel%20class_logo%20pc.png"
                alt="Pixel Class logo"
                className="mr-2 w-full h-fit"
              />
            </Link>
          </div>
        </div>

        {!isEmailSent ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="font-ff block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your registered email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="flex items-center justify-between">
              <button type="button" className="text-blue-600 hover:underline" onClick={handleLogin}>
                Log in
              </button>
              <button
                type="submit"
                className="w-lg flex items-center px-4 py-2 bg-green-700 text-white font-ff rounded-md hover:bg-green-800"
                disabled={loading}
              >
                {loading ? <div className="loader"></div> : <>Send Email <i className="fas fa-arrow-right ml-2"></i></>}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center p-4 border rounded-lg bg-green-50 border-green-400">
            <div className="text-green-800 text-xl font-semibold">{successMessage}</div>
            <div className="text-green-600 text-sm">
              Please check your inbox and follow the instructions to reset your password.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forgetpassword;