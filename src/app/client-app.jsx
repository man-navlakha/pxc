"use client";

import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "../App";

const GOOGLE_CLIENT_ID =
  "724330412810-krfm9oo85om3vkt9gcs65turjgpokdbh.apps.googleusercontent.com";

export default function ClientApp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center">
          <img
            src="https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png"
            alt="Pixel Class"
            className="mx-auto mb-4 h-14 w-14"
          />
          <p className="text-sm text-neutral-400">Loading Pixel Class...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
