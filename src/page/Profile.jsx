import React, { useState, useEffect } from 'react';
import '../new.css'
import Cookies from "js-cookie";
import Navbar from '../componet/Navbar'
import Footer from '../componet/Footer'
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import FollowingPage from './FollowingPage';
import FollowersPage from './FollowersPage';

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
  const nameFromUrl = urlParams.get('username');
  const [isFollowing, setIsFollowing] = useState(false);
  const usernamec = Cookies.get("username");

  if (nameFromUrl) {
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


    useEffect(() => {
      const fetchFollowStatus = async () => {
        if (!nameFromUrl || !usernamec) return;

        try {
          // 1. Get who the logged-in user is following
          const followingRes = await axios.post(
            "https://pixel-classes.onrender.com/api/Profile/following/",
            { username: usernamec }
          );
          const followingUsernames = followingRes.data.map(u => u.username);

          // 2. Check if the current profile is among those
          setIsFollowing(followingUsernames.includes(nameFromUrl));
        } catch (err) {
          console.error("Error checking follow status:", err);
        }
      };

      fetchFollowStatus();
    }, [nameFromUrl]);





  } else {

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
        .then(res => {
          setPosts(res.data.posts || []);
          console.log(res.data.posts);
        }) // <-- use res.data.posts
        .catch(() => setError("Failed to load Notes"));
    }, [Username]);



  }

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



  const follow = async () => {
    try {
      await axios.post("https://pixel-classes.onrender.com/api/Profile/follow/", {
        follower: usernamec,
        following: nameFromUrl
      });
      setIsFollowing(true);
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const unfollow = async () => {
    try {
      await axios.post("https://pixel-classes.onrender.com/api/Profile/unfollow/", {
        follower: usernamec,
        following: nameFromUrl
      });
      setIsFollowing(false);
    } catch (err) {
      console.error("Unfollow error:", err);
    }
  };



  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this repository?")) {
      try {
        await axios.post('https://pixel-classes.onrender.com/api/Profile/deletePost/', {
          username: Username,
          postId,
        });

        setPosts(posts.filter(p => p.id !== postId));
      } catch (err) {
        console.error("Delete error:", err.response?.data || err.message);
        alert("Failed to delete repository.");
      }
    }
  };


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
                  {
                    loading ? <>
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
                      :
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
                  }
                </div>

              </div>
              <div className="flex-1 flex flex-col items-center md:items-start">

                {
                  loading ? <>

                    <h1 className="flex items-center justify-center text-4xl font-extrabold bg-gradient-to-tr from-blue-300 to-green-500 text-transparent bg-clip-text text-center md:text-left">
                      <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[160px]"> </div>
                    </h1>

                  </>
                    :
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

                      {console.log("Current page:", page)}

                      {/* {nameFromUrl ? '' :
                      <>
                        <p className="mt-2 text-lg text-white/80 font-medium text-center md:text-left flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm mr-2 ">
                            alternate_email
                          </span> {profile?.email || "No email found"}
                        </p>
                        </>
                      } */}
                    </>
                }
                {nameFromUrl ? <> {nameFromUrl && (
                  <div className="mt-4 flex gap-4">
                    {isFollowing ? (
                      <button
                        onClick={unfollow}
                        className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500/80 hover:bg-red-600/90 text-white font-bold shadow transition"
                      >
                        <span className="material-symbols-outlined">person_remove</span> Unfollow
                      </button>
                    ) : (
                      <button
                        onClick={follow}
                        className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-500/80 hover:bg-blue-600/90 text-white font-bold shadow transition"
                      >
                        <span className="material-symbols-outlined">person_add</span> Follow
                      </button>
                    )}
                    <button className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-800/30 hover:bg-gray-500/50 text-white font-bold shadow transition">
                      <span className="material-symbols-outlined">chat</span> Message
                    </button>
                  </div>
                )}

                </> : <>
                  {
                    loading ? <>
                      <div className="mt-4 flex gap-4">
                        <button className="glass-btn flex items-center gap-2 px-5 py-3 rounded-xl shadow transition">
                          <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[120px]"> </div>
                        </button>
                        <button className="glass-btn flex items-center gap-2 px-5 py-3 rounded-xl shadow transition">
                          <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[120px]"> </div>
                        </button>
                      </div>
                      <button className="glass-btn flex items-center bg-green-600/30 gap-2 px-5 py-3 mt-4 rounded-xl shadow transition">
                        <div className="animate-pulse rounded-md bg-green-500/60 h-4 w-[170px]"> </div>
                      </button>
                    </>
                      :
                      <>
                        <div className="mt-4 flex gap-4">
                          <button className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500/80 hover:bg-red-600/90 text-white font-bold shadow transition">
                            <span className="material-symbols-outlined">logout</span> Logout
                          </button>
                          <button onClick={() => setIsopen(true)} className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-white/30 hover:bg-white/50 text-black font-bold shadow transition">
                            <span className="material-symbols-outlined">edit_square</span> Update
                          </button>
                        </div>
                        {/* <div className="mt-6 glass-info text-center p-3 rounded-xl border border-green-600/30 bg-green-900/40 text-green-200 font-medium shadow">
                          Last selected sem: <strong>{sem || "N/A"}</strong>
                        </div> */}
                      </>
                  }

                </>
                }

              </div>
            </div>

            {page === "following" ? (
              <FollowingPage username={profile?.username || Username} />
            ) : page === "followers" ? (
              <FollowersPage username={profile?.username || Username} />
            ) : (
              <>
                {/* Notes Section */}
                <div className="mt-10">
                  <h2 className="text-2xl font-bold text-white/90 mb-4 m-6 flex items-center gap-2">
                    <span className="material-symbols-outlined">book_5</span> Notes
                  </h2>
                  {loading &&
                    <div className="glass-info p-6 m-3 rounded-xl border border-white/10 bg-white/10 backdrop-blur-lg shadow flex flex-col gap-2">
                      <div className="flex items-top gap-2">
                        <span className="material-symbols-outlined text-blue-400"> <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[50px]"> </div></span>
                        <span className="font-bold text-lg text-white mr-2"> <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[170px]"> </div>
                          <div className='flex items-center mt-3'>
                            <span className="material-symbols-outlined text-blue-400 mr-2 "><div className="animate-pulse rounded-md bg-gray-500 h-4 w-[50px]"> </div></span>
                            <span className='font-medium text-md text-gray-300' > <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[200px]"> </div></span>
                          </div>
                          {/* <div className='flex items-center'>
                            <span className="material-symbols-outlined text-blue-400">chevron_forward</span>
                            <span className='font-medium text-md text-gray-300' >Semester : {post.sem}</span>
                          </div>
                          <div className='flex items-center'>
                            <span className="material-symbols-outlined text-blue-400">chevron_forward</span>
                            <span className='font-medium text-md text-gray-300' >{post.choose}</span>
                          </div> */}

                        </span>
                      </div>
                      {/* <div className="text-white/80 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-400">person</span>
                        <span>{post.name}</span>
                      </div> */}
                      <div className="flex gap-2 mt-2">
                        <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[170px]"> </div>
                        {!nameFromUrl && <>
                          <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[170px]"> </div>
                          <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[170px]"> </div>

                        </>}

                      </div>
                    </div>



                  }
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
                              {/* <div className='flex items-center'>
                            <span className="material-symbols-outlined text-blue-400">chevron_forward</span>
                            <span className='font-medium text-md text-gray-300' >Semester : {post.sem}</span>
                          </div>
                          <div className='flex items-center'>
                            <span className="material-symbols-outlined text-blue-400">chevron_forward</span>
                            <span className='font-medium text-md text-gray-300' >{post.choose}</span>
                          </div> */}

                            </span>
                          </div>
                          {/* <div className="text-white/80 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-400">person</span>
                        <span>{post.name}</span>
                      </div> */}
                          <div className="flex gap-2 mt-2">
                            <a
                              href={post.pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded bg-blue-500/80 hover:bg-blue-600 text-white font-semibold flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined">download</span> PDF
                            </a>
                            {!nameFromUrl && <>
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

                            </>}

                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}


          </div>
        </div>
      </div>
      <Footer />




      {isopen &&
        <div className="z-50 loveff flex justify-center items-center inset-0 fixed bg-black p-4 bg-opacity-50 " >
          <div className="flex flex-col border-2 border-white p-6 rounded-lg shadow-lg relative bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-[#1d4ed8] via-[#1e40af] to-[#111827] ">
            <div>
              <button
                onClick={() => setIsopen(false)}
                className="absolute top-2 right-4 text-3xl text-red-500 dark:text-gray-100 hover:text-red-200 dark:hover:text-white "
              >
                x
              </button>
              <span className="loveff bg-gradient-to-tr from-white via-stone-400  to-neutral-300 bg-clip-text  text-transparent text-center font-black text-2xl mb-2" >Edit Your Profile</span>
              <p className='text-gray-400' >for {profile?.username || "Guest"}</p>

            </div>
            <form onSubmit={"s"}>
              <div className="flex flex-col gap-4 justify-center items-center">
                <label htmlFor="username">
                  <input type="text" id='username' name='username' onChange={(e) => setusernameedit(e.target.value)} placeholder='Username' className="w-full p-2 border border-gray-300 text-gray-100 bg-[#383838] rounded-lg" required />
                </label>
                <label htmlFor="name"> </label>

                <button type="submit" disabled={loading} className="smky-btn3 relative text-white hover:text-[#778464] py-2 px-6 after:absolute after:h-1 after:hover:h-[200%] transition-all duration-500 hover:transition-all hover:duration-500 after:transition-all after:duration-500 after:hover:transition-all after:hover:duration-500 overflow-hidden z-20 after:z-[-20] after:bg-[#abd373] after:rounded-t-full after:w-full after:bottom-0 after:left-0 text-gray-600"> {loading ? (
                  <div className="s-loading"></div> // Display s-loading inside the button
                ) : (
                  "Submit"
                )}</button>
              </div>
            </form>
          </div>
        </div>
      }













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