import React, { useState, useEffect } from 'react';
import '../new.css'
import Cookies from "js-cookie";
import Navbar from '../componet/Navbar'
import Footer from '../componet/Footer'
import axios from "axios";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import FollowingPage from './FollowingPage';
import FollowersPage from './FollowersPage';
import ProfileEditForm from './ProfileEditForm';
import FloatingMessagesButton from '../componet/FloatingMessagesButton';

const Profile = () => {
  const Username = Cookies.get("username");
  const sem = Cookies.get("latest_sem");
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isopen, setIsopen] = useState(false);
  const [usernameedit, setusernameedit] = useState("");
  const [error, setError] = useState(null);
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const urlusername = urlParams.get('username');
  const { nameFromUrl } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);
  const usernamec = Cookies.get("username");
  const token = Cookies.get('access_token');
  const navigate = useNavigate();

  { urlusername && navigate(`/profile/${urlusername}`) }
  // Unified profile and posts fetch
  useEffect(() => {
    !token && navigate("/")
    const userToFetch = nameFromUrl || Username;
    if (!userToFetch) return;
    setLoading(true);
    axios.post('https://pixel-classes.onrender.com/api/Profile/details/', { username: userToFetch })
      .then(res => setProfile(res.data))
      .catch(() => setError("Failed to load profile details"))
      .finally(() => setLoading(false));

    axios.post('https://pixel-classes.onrender.com/api/Profile/posts/', { username: userToFetch })
      .then(res => setPosts(res.data.posts || []))
      .catch(() => setError("Failed to load Notes"));
  }, [nameFromUrl, Username, token]);

  // Follow status
  useEffect(() => {
    if (!nameFromUrl || !usernamec) return;
    const fetchFollowStatus = async () => {
      try {
        const followingRes = await axios.post(
          "https://pixel-classes.onrender.com/api/Profile/following/",
          { username: usernamec }
        );
        const followingUsernames = followingRes.data.map(u => u.username);
        setIsFollowing(followingUsernames.includes(nameFromUrl));
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    };
    fetchFollowStatus();
  }, [nameFromUrl, usernamec]);

  // Follow/unfollow functions
  const follow = async (follow_username) => {
    try {
      const response = await axios.post(
        "https://pixel-classes.onrender.com/api/Profile/follow/",
        {
          username: usernamec,
          follow_username: follow_username,
        }
      );
      if (response.data.message) {
        alert(`You are now following ${follow_username}`);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const unfollow = async (unfollow_username) => {
    try {
      const response = await axios.post(
        "https://pixel-classes.onrender.com/api/Profile/unfollow/",
        {
          username: usernamec,
          unfollow_username: unfollow_username,
        }
      );
      if (response.data.message) {
        alert(`removed`);
        setIsFollowing(false);
      }
    } catch (error) {
      console.error("Error unfollow user:", error);
    }
  };

  // Edit profile handler
  const handleProfileEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    formData.append("username", Username);

    try {
      const response = await axios.put(
        "https://pixel-classes.onrender.com/api/Profile/edit/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.data.success) {
        alert("Profile updated successfully!");
        window.location.reload();
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      alert("Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  // Edit post handler
  const handleEdit = async (post) => {
    const newTitle = prompt("Edit repository name:", post.title);
    if (newTitle && newTitle !== post.title) {
      try {
        await axios.put('https://pixel-classes.onrender.com/api/Profile/editPost/', {
          id: post.id,
          title: newTitle,
        });
        setPosts(posts.map(p => p.id === post.id ? { ...p, title: newTitle } : p));
      } catch {
        alert("Failed to edit repository.");
      }
    }
  };

  const handleDelete = async (pdf_url) => {
    if (!pdf_url) {
      alert("PDF URL is required to delete the repository.");
      return;
    }
    const pdfUrlStr = String(pdf_url);
    if (window.confirm("Are you sure you want to delete this repository?")) {
      try {
        await axios.delete(
          "https://pixel-classes.onrender.com/api/Profile/deletePost/",
          {
            data: { pdf_url: pdfUrlStr, username: Cookies.get("username") }
          }
        );
        setPosts(posts.filter(p => p.pdf !== pdfUrlStr));
      } catch (err) {
        console.error("Delete error:", err.response?.data || err.message);
        alert("Failed to delete repository.");
      }
    }
  };

  return (
    <>
      <div className="bg-pattern"></div>
      <div className='mesh_profile ccf text-white pb-14 h-full min-h-screen'>
        <Navbar />
        <div className='flex flex-col items-center mt-10 justify-center'>
          <div className="w-full max-w-4xl mx-auto mt-10">
            {/* Profile Header */}
            <div className="glass-card rounded-3xl m-3 border border-white/20 bg-white/10 backdrop-blur-xl p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="flex flex-col items-center md:items-start">
                <div className="relative">
                  {loading ? (
                    <>
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className="w-32 h-32 rounded-full border-4 border-white/30 shadow-lg object-cover me-3 text-gray-200 dark:text-gray-400"
                      >
                        <path
                          d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"
                        ></path>
                      </svg>
                      <span className="absolute bottom-2 right-2 bg-green-400/80 text-white px-2 py-1 rounded-full text-xs font-bold shadow">
                        {loading && "loading..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <img
                        className="w-32 h-32 rounded-full border-4 border-white/30 shadow-lg object-cover"
                        src={profile?.profile_pic
                          ? profile.profile_pic
                          : "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png"}
                        alt="Profile"
                      />
                      <span className="absolute bottom-2 right-2 bg-green-400/80 text-white px-2 py-1 rounded-full text-xs font-bold shadow">
                        {Username ? "Active" : "Guest"}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {nameFromUrl === usernamec && navigate("/profile")}

              <div className="flex-1 flex flex-col items-center md:items-start">
                {loading ? (
                  <h1 className="flex items-center justify-center text-4xl font-extrabold bg-gradient-to-tr from-blue-300 to-green-500 text-transparent bg-clip-text text-center md:text-left">
                    <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[160px]"> </div>
                  </h1>
                ) : (
                  <>
                    <h1 className="flex items-center justify-center mb-2 text-4xl font-extrabold bg-gradient-to-tr from-blue-300 to-green-500 text-transparent bg-clip-text text-center md:text-left">
                      <span className="material-symbols-outlined"></span>{profile?.username || "Guest"}
                    </h1>
                    <div className='flex cursor-pointer items-center justify-between gap-3 '>
                      <div onClick={() => setPage("followers")} className='flex flex-col items-center justify-center'>
                        <p>{profile?.follower_count || 0}</p>
                        <p>Followers</p>
                      </div>
                      <div onClick={() => setPage("following")} className='flex cursor-pointer flex-col items-center justify-center'>
                        <p>{profile?.following_count || 0}</p>
                        <p>Following</p>
                      </div>
                    </div>
                  </>
                )}
                {nameFromUrl ? (
                  <div className="mt-4 flex gap-4">
                    {isFollowing ? (
                      <button
                        onClick={() => unfollow(nameFromUrl)}
                        className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500/80 hover:bg-red-600/90 text-white font-bold shadow transition"
                      >
                        <span className="material-symbols-outlined">person_remove</span> Unfollow
                      </button>
                    ) : (
                      <button
                        onClick={() => follow(nameFromUrl)}
                        className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-500/80 hover:bg-blue-600/90 text-white font-bold shadow transition"
                      >
                        <span className="material-symbols-outlined">person_add</span> Follow
                      </button>
                    )}
                    <button onClick={() => navigate(`/chat/${nameFromUrl}`)} className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-800/30 hover:bg-gray-500/50 text-white font-bold shadow transition">
                      <span className="material-symbols-outlined">chat</span> Message
                    </button>
                  </div>
                ) : (
                  <>
                    {loading ? (
                      <div className="mt-4 flex gap-4">
                        <button className="glass-btn flex items-center gap-2 px-5 py-3 rounded-xl shadow transition">
                          <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[120px]"> </div>
                        </button>
                        <button className="glass-btn flex items-center gap-2 px-5 py-3 rounded-xl shadow transition">
                          <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[120px]"> </div>
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 flex gap-4">
                        <button onClick={() => navigate("/logout")} className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500/80 hover:bg-red-600/90 text-white font-bold shadow transition">
                          <span className="material-symbols-outlined">logout</span> Logout
                        </button>
                        <button onClick={() => setPage("edit")} className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-white/30 hover:bg-white/50 text-black font-bold shadow transition">
                          <span className="material-symbols-outlined">edit_square</span> Update
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Conditional Pages */}
            {page === "following" ? (
              <FollowingPage username={profile?.username || Username} />
            ) : page === "followers" ? (
              <FollowersPage username={profile?.username || Username} />
            ) : page === "edit" ? (
              <div className="flex flex-col p-4">
                <button onClick={() => window.location.reload()} className='flex w-full max-w-max px-6 py-1 rounded justify- my-2 bg-gray-100
    bg-clip-padding
    backdrop-filter
    backdrop-blur-xl
    bg-opacity-10
    backdrop-saturate-100
    backdrop-contrast-100 '>
                  Close
                </button>
                <ProfileEditForm profile={usernamec} />

              </div>
            ) : (
              // Notes Section
              <div className="mt-10">
                <h2 className="text-2xl font-bold text-white/90 mb-4 m-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">book_5</span> Notes
                </h2>
                {loading && (
                  <div className="glass-info p-6 m-3 rounded-xl border border-white/10 bg-white/10 backdrop-blur-lg shadow flex flex-col gap-2">
                    <div className="flex items-top gap-2">
                      <span className="material-symbols-outlined text-blue-400">
                        <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[50px]"> </div>
                      </span>
                      <span className="font-bold text-lg text-white mr-2">
                        <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[170px]"> </div>
                        <div className='flex items-center mt-3'>
                          <span className="material-symbols-outlined text-blue-400 mr-2 ">
                            <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[50px]"> </div>
                          </span>
                          <span className='font-medium text-md text-gray-300'>
                            <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[200px]"> </div>
                          </span>
                        </div>
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[170px]"> </div>
                      {!nameFromUrl && (
                        <>
                          <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[170px]"> </div>
                          <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[170px]"> </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                <div className=" gap-6">
                  {posts.length === 0 && !loading ? (
                    <div className="glass-info p-6 m-2 rounded-xl border border-white/10 bg-white/10 backdrop-blur-lg shadow text-center text-white/70">
                      No Notes found.
                      {error && <div className="text-center text-red-400 mt-4">{error}</div>}
                    </div>
                  ) : (
                    posts.map(post => (
                      <div key={post.id} className="glass-info p-6 m-3 rounded-xl border border-white/10 bg-white/10 backdrop-blur-lg shadow flex flex-col gap-2">
                        <div className="flex items-top gap-2">
                          <span className="material-symbols-outlined text-blue-400">book</span>
                          <span className="font-bold text-lg text-white">{post.contant}
                            <div className='flex items-top'>
                              <span className="material-symbols-outlined text-blue-400">chevron_forward</span>
                              <span className='font-medium text-md text-gray-300' >{post.choose} in {post.sub} for Semester {post.sem}</span>
                            </div>
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <a
                            href={post.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded backdrop-filter
    backdrop-blur-xl bg-blue-800/60 hover:bg-blue-600/50 text-white font-semibold flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined">download</span> PDF
                          </a>
                          {!nameFromUrl && (
                            <>
                              {/* <button
                                className="px-3 py-1 rounded bg-yellow-400/80  bg-clip-padding
    backdrop-filter
    backdrop-blur-xl
    bg-opacity-10
    backdrop-saturate-100
    backdrop-contrast-100  hover:bg-yellow-800/30 hover:text-white text-black font-semibold"
                                onClick={() => handleEdit(post)}
                              >
                                Edit
                              </button> */}
                              <button
                                className="px-3 py-1 rounded bg-red-500/80 hover:bg-red-600 text-white font-semibold"
                                onClick={() => handleDelete(post.pdf)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <FloatingMessagesButton />


      {/* Glassmorphism CSS */}
      <style>{`
        .glass-card {
          background: rgba(255,255,255,0.08);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.18);
        }
        .glass-btn {
          backdrop-filter: blur(8px);
        }
        .glass-info {
          backdrop-filter: blur(6px);
        }
      `}</style>
    </>
  )
}

export default Profile