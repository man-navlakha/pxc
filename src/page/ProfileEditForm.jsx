import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const ProfileEditForm = ({ profile }) => {
    const usernamec = Cookies.get("username");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [usernameEdit, setUsernameEdit] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setUsernameEdit(profile.username || "");
    }
  }, [profile]);

  const handleProfileEdit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("username", usernamec);
    formData.append("new_username", usernameEdit);
    const fileInput = e.target.profile_pic;
    if (fileInput?.files[0]) {
      formData.append("profile_pic", fileInput.files[0]);
    }
console.log({
    username: usernamec,
    new_username: usernameEdit,
    profile_pic: fileInput?.files[0] || null,
});
    try {
      const response = await axios.put(
        "https://pixel-classes.onrender.com/api/Profile/edit/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

          if (response.data.success) {
            alert("Profile updated successfully!");
            if (usernamec !== usernameEdit) {
              Cookies.set("username", usernameEdit);
            }
            window.location.reload();
          } else {
            alert("Failed to update profile.");
          }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("An error occurred while updating your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleProfileEdit}>
      <div className="flex flex-col gap-4 justify-center items-center">
        <label htmlFor="profile_pic" className="w-full">
          <input
            type="file"
            id="profile_pic"
            name="profile_pic"
            className="w-full p-2 border border-gray-300 text-gray-100 bg-[#383838] rounded-lg"
          />
        </label>
        
{/* 
        <label htmlFor="first_name" className="w-full">
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            className="w-full p-2 border border-gray-300 text-gray-100 bg-[#383838] rounded-lg"
            required
          />
        </label>

        <label htmlFor="last_name" className="w-full">
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            className="w-full p-2 border border-gray-300 text-gray-100 bg-[#383838] rounded-lg"
            required
          />
        </label> */}

        <label htmlFor="username" className="w-full">
          <input
            type="text"
            id="username"
            name="username"
            value={usernameEdit}
            onChange={(e) => setUsernameEdit(e.target.value)}
            placeholder="Username"
            className="w-full p-2 border border-gray-300 text-gray-100 bg-[#383838] rounded-lg"
            
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="smky-btn3 relative text-white hover:text-[#778464] py-2 px-6 after:absolute after:h-1 after:hover:h-[200%] transition-all duration-500 hover:transition-all hover:duration-500 after:transition-all after:duration-500 after:hover:transition-all after:hover:duration-500 overflow-hidden z-20 after:z-[-20] after:bg-[#abd373] after:rounded-t-full after:w-full after:bottom-0 after:left-0 text-gray-600"
        >
          {loading ? <div className="s-loading"></div> : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
