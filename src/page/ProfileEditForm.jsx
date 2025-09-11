// ProfileEditForm.jsx
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import api from "../utils/api";

// 🔄 Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const ProfileEditForm = ({ profile, onUpdateSuccess }) => {
  const originalUsername = Cookies.get("username");
  const [username, setUsername] = useState(originalUsername || "");
  const [profilePic, setProfilePic] = useState(null);
  const [imagePreview, setImagePreview] = useState(profile?.profile_pic || null);
  const [loading, setLoading] = useState(false);

  // 🔍 Username validation state
  const [usernameStatus, setUsernameStatus] = useState("idle"); // idle, checking, available, taken, forbidden, short
  const debouncedUsername = useDebounce(username, 500);

  const forbiddenUsernames = [
    "pxc",
    "pixel",
    "pixelclass",
    "admin",
    "support",
    "kill",
    "murder",
    "terrorist",
    "abuse",
  ];

  // 🔎 Effect for real-time username validation
  useEffect(() => {
    console.log("🔍 Debounced username:", debouncedUsername);

    if (debouncedUsername === originalUsername) {
      setUsernameStatus("idle");
      return;
    }
    if (debouncedUsername.length < 3) {
      setUsernameStatus("short");
      return;
    }

    const isForbidden = forbiddenUsernames.some((f) =>
      debouncedUsername.toLowerCase().includes(f)
    );
    if (isForbidden) {
      setUsernameStatus("forbidden");
      return;
    }

    const checkUsername = async () => {
      setUsernameStatus("checking");
      console.log("⏳ Checking availability...");

      try {
        const res = await api.get("Profile/UserSearch/", {
          params: { username: debouncedUsername },
        });

        console.log("📡 API response:", res.data);

        if (Array.isArray(res.data)) {
          const exactMatch = res.data.some(
            (u) =>
              u.username === debouncedUsername.toLowerCase()
          );
          if (exactMatch) {
            console.log("❌ Username already taken (exact match)");
            setUsernameStatus("taken");
          } else {
            console.log("✅ Username available (no exact match)");
            setUsernameStatus("available");
          }
        } else if (res.data.exists === true) {
          console.log("❌ Username already taken (exists=true)");
          setUsernameStatus("taken");
        } else {
          console.log("✅ Username available");
          setUsernameStatus("available");
        }
      } catch (error) {
        console.error("⚠️ Error checking username:", error);
        setUsernameStatus("idle");
      }
    };

    checkUsername();
  }, [debouncedUsername, originalUsername]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileEdit = async (e) => {
    e.preventDefault();
    if (["taken", "forbidden", "short"].includes(usernameStatus)) {
      return toast.error("Please fix the errors before submitting.");
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("new_username", username);
    if (profilePic) {
      formData.append("profile_pic", profilePic);
    }
console.log(formData)
    try {
      const response = await api.put("Profile/edit/", formData);

      if (response.data.message) {
        toast.success("Profile updated successfully!");
        window.location.href = "/profile"
        onUpdateSuccess(response.data.user);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || "An error occurred while updating."
      );
    } finally {
      setLoading(false);
    }
  };

  const UsernameStatusIcon = () => {
    switch (usernameStatus) {
      case "checking":
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/50"></div>
        );
      case "available":
        return (
          <span className="material-symbols-outlined text-green-500">
            check_circle
          </span>
        );
      case "taken":
      case "forbidden":
      case "short":
        return (
          <span className="material-symbols-outlined text-red-500">error</span>
        );
      default:
        return null;
    }
  };

  return (
    <motion.form
      onSubmit={handleProfileEdit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Profile Picture */}
      <div className="flex flex-col items-center gap-4">
        <label htmlFor="profile_pic" className="cursor-pointer">
          <img
            src={
              imagePreview || `https://i.pravatar.cc/150?u=${originalUsername}`
            }
            alt="Profile Preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-white/30 hover:opacity-80 transition-opacity"
          />
        </label>
        <input
          type="file"
          id="profile_pic"
          name="profile_pic"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => document.getElementById("profile_pic").click()}
          className="text-sm text-blue-400 hover:underline"
        >
          Change Photo
        </button>
      </div>

      {/* Username Field */}
      <div className="relative">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-white/70 mb-1"
        >
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
          placeholder="New Username"
          className="w-full p-3 pr-10 border border-white/20 text-white bg-white/5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
        <div className="absolute inset-y-0 right-3 top-7 flex items-center">
          <UsernameStatusIcon />
        </div>

        {/* Error messages */}
        <AnimatePresence>
          {["taken", "forbidden", "short"].includes(usernameStatus) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs mt-1"
            >
              {usernameStatus === "taken" && "This username is already taken."}
              {usernameStatus === "forbidden" &&
                "This username contains a forbidden word."}
              {usernameStatus === "short" &&
                "Username must be at least 3 characters."}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={
          loading || ["checking", "taken", "forbidden", "short"].includes(usernameStatus)
        }
        className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed font-semibold"
      >
        {loading ? <div className="s-loading mx-auto"></div> : "Save Changes"}
      </button>
    </motion.form>
  );
};

export default ProfileEditForm;
