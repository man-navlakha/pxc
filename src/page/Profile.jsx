import React, { useState, useEffect } from 'react';
import '../new.css'
import Cookies from "js-cookie";
import Navbar from '../componet/Navbar'
import Footer from '../componet/Footer'
import axios from "axios";
import { useLocation } from 'react-router-dom';

const Profile = () => {
  const Username = Cookies.get("username");
  const sem = Cookies.get("latest_sem");
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const nameFromUrl = urlParams.get('username');
  if(nameFromUrl){
    
  // Fetch profile details
  useEffect(() => {
    if (!Username) return;
    setLoading(true);
    axios.post('https://pixel-classes.onrender.com/api/Profile/details/', { username: nameFromUrl })
      .then(res => setProfile(res.data))
      .catch(() => setError("Failed to load profile details"))
      .finally(() => setLoading(false));
  }, [nameFromUrl]);

   
useEffect(() => {
  if (!nameFromUrl) return;
  axios.post('https://pixel-classes.onrender.com/api/Profile/posts/', { username: nameFromUrl })
    .then(res => setPosts(res.data.posts || [])) // <-- use res.data.posts
    .catch(() => setError("Failed to load Notes"));
}, [nameFromUrl]);


  }else{

  // Fetch profile details
  useEffect(() => {
    if (!Username) return;
    setLoading(true);
    axios.post('https://pixel-classes.onrender.com/api/Profile/details/', { username: Username })
      .then(res => setProfile(res.data))
      .catch(() => setError("Failed to load profile details"))
      .finally(() => setLoading(false));
  }, [Username]);


  
useEffect(() => {
  if (!Username) return;
  axios.post('https://pixel-classes.onrender.com/api/Profile/posts/', { username: Username })
    .then(res => setPosts(res.data.posts || [])) // <-- use res.data.posts
    .catch(() => setError("Failed to load Notes"));
}, [Username]);

console.log(posts);
console.log(profile);




  // Edit post handler (opens a prompt for simplicity)
  const handleEdit = async (post) => {
    const newTitle = prompt("Edit repository name:", post.title);
    if (newTitle && newTitle !== post.title) {
      try {
        await axios.put('https://pixel-classes.onrender.com/api/Profile/edit/', {
          username: Username,
          postId: post.id,
          title: newTitle,
        });
        setPosts(posts.map(p => p.id === post.id ? { ...p, title: newTitle } : p));
      } catch {
        alert("Failed to edit repository.");
      }
    }
  };

  // Delete post handler
  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this repository?")) {
      try {
        await axios.delete('https://pixel-classes.onrender.com/api/Profile/deletePost/', {
          username: Username,
          postId,
        });
        setPosts(posts.filter(p => p.id !== postId));
      } catch {
        alert("Failed to delete repository.");
      }
    }
  };
}

  return (
    <>
      <div className="bg-pattern"></div>
    <div className='mesh_profile ccf text-white h-full min-h-screen'>
      <Navbar />
      <div className='flex flex-col items-center mt-10 justify-center'>
        <div className="w-full max-w-4xl mx-auto mt-10">
          {/* Profile Header */}
          <div className="glass-card rounded-3xl m-3 border border-white/20 bg-white/10 backdrop-blur-xl p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="relative">
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
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center md:items-start">
              <h1 className="flex items-center justify-center text-4xl font-extrabold bg-gradient-to-tr from-blue-300 to-green-500 text-transparent bg-clip-text text-center md:text-left">
               <span className="material-symbols-outlined mr-2">person</span> {profile?.username || "Guest"}
              </h1>
              <p className="mt-2 text-lg text-white/80 font-medium text-center md:text-left flex items-center justify-center">
                <span className="material-symbols-outlined text-sm mr-2 ">
alternate_email 
</span> {profile?.email || "No email found"}
              </p>
              {nameFromUrl ? <>   <div className="mt-4 flex gap-4">
                <button className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-500/80 hover:bg-blue-600/90 text-white font-bold shadow transition">
                  <span className="material-symbols-outlined">person_add</span> Follow
                </button>
                <button className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-800/30 hover:bg-gray-500/50 text-white font-bold shadow transition">
                  <span className="material-symbols-outlined">chat</span> Meassage
                </button>
              </div></> : <>
                 <div className="mt-4 flex gap-4">
                <button className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500/80 hover:bg-red-600/90 text-white font-bold shadow transition">
                  <span className="material-symbols-outlined">logout</span> Logout
                </button>
                <button className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-white/30 hover:bg-white/50 text-black font-bold shadow transition">
                  <span className="material-symbols-outlined">edit_square</span> Update
                </button>
              </div>
              <div className="mt-6 glass-info text-center p-3 rounded-xl border border-green-600/30 bg-green-900/40 text-green-200 font-medium shadow">
                Last selected sem: <strong>{sem || "N/A"}</strong>
              </div>
              </>
              }
           
            </div>
          </div>
          {/* Notes Section */}
<div className="mt-10">
  <h2 className="text-2xl font-bold text-white/90 mb-4 m-6 flex items-center gap-2">
    <span className="material-symbols-outlined">book_5</span> Notes
  </h2>
  {loading && <div className="text-center text-white mt-4">Loading profile...</div>}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {posts.length === 0 && !loading ? (
      <div className="glass-info p-6 m-2 rounded-xl border border-white/10 bg-white/10 backdrop-blur-lg shadow text-center text-white/70">
        No Notes found.
        {error && <div className="text-center text-red-400 mt-4">{error}</div>}
      </div>
    ) : (
      posts.map(post => (
        <div key={post.id} className="glass-info p-6 m-3 rounded-xl border border-white/10 bg-white/10 backdrop-blur-lg shadow flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">book</span>
            <span className="font-bold text-lg text-white">{post.contant}</span>
          </div>
          <div className="text-white/80 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400">person</span>
            <span>{post.name}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <a
              href={post.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded bg-blue-500/80 hover:bg-blue-600 text-white font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined">download</span> PDF
            </a>
            <button
              className="px-3 py-1 rounded bg-yellow-400/80 hover:bg-yellow-500 text-black font-semibold"
              onClick={() => handleEdit(post)}
            >
              Edit
            </button>
            <button
              className="px-3 py-1 rounded bg-red-500/80 hover:bg-red-600 text-white font-semibold"
              onClick={() => handleDelete(post.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))
    )}
  </div>
</div>
        </div>
      </div>
      </div>
      <Footer />
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