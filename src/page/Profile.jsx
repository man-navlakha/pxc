import React, { useState, useEffect, Suspense, lazy } from "react";
import "../new.css";
import Cookies from "js-cookie";
import Navbar from "../componet/Navbar";
import Footer from "../componet/Footer";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FloatingMessagesButton from "../componet/FloatingMessagesButton";
import DownloadHistory from "../componet/DownloadHistory";
import api from "../utils/api";
import { verifiedUsernames } from "../verifiedAccounts";
import VerifiedBadge from "../componet/VerifiedBadge";
import NotFollowingBack from "./NotFollowingBack";

// Lazy load heavy sub-pages
const FollowingPage = lazy(() => import("./FollowingPage"));
const FollowersPage = lazy(() => import("./FollowersPage"));
const ProfileEditForm = lazy(() => import("./ProfileEditForm"));

const Profile = () => {
  let Username = "Guest"; // Changed from const to let
  const accessToken = Cookies.get("access");
  const { nameFromUrl } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [userToFetch, setUserToFetch] = useState("Guest");
  const [page, setPage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Redirect if query param ?username= is present
  const urlParams = new URLSearchParams(location.search);
  const urlusername = urlParams.get("username");
  useEffect(() => {
    if (urlusername) {
      navigate(`/profile/${urlusername}`);
    }
  }, [urlusername, navigate]);

  // --- Fetch profile + posts ---

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Step 1: Always fetch current user first
        const res = await api.post("/Profile/details/", {
          username: nameFromUrl || undefined, // ✅ always send something
        });

        const currentUser = res.data.username;
        const targetUser = nameFromUrl || currentUser;

        setUserToFetch(targetUser);

        console.log("Target user to fetch:", targetUser);
        console.log("Current user:", currentUser);

        // Step 2: Fetch profile details (redundant but safe)
        const details = await api.post("/Profile/details/", {
          username: targetUser,
        });

        // Step 3: Fetch posts
        const postsRes = await api.post("/Profile/posts/", {
          username: targetUser,
        });

        // Merge data
        setProfile({
          ...res.data,
          ...details.data,
        });
        setPosts(postsRes.data.posts || []);
      } catch (err) {
        console.error("[PROFILE FETCH ERROR]", err);
        setProfile(null);
        setPosts([]);
        if (err.response?.status === 401) {
          navigate("/auth/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [nameFromUrl, navigate]);


  // --- Fetch follow status ---
  useEffect(() => {
    if (!nameFromUrl || !Username || nameFromUrl === Username) return;

    const fetchFollowStatus = async () => {
      try {
        const res = await api.post("/Profile/following/", {
          username: nameFromUrl,
        });
        const isUserFollowing = res.data.some((u) => u.username === Username);
        setIsFollowing(isUserFollowing);
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    };

    fetchFollowStatus();
  }, [nameFromUrl, Username]);

  // --- Follow / Unfollow ---
  const follow = async (follow_username) => {
    try {
      await api.post("/Profile/follow/", {
        username: Username,
        follow_username,
      });
      setIsFollowing(true);
      setProfile((p) =>
        p ? { ...p, follower_count: (p.follower_count || 0) + 1 } : p
      );
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const unfollow = async (unfollow_username) => {
    try {
      await api.post("/Profile/unfollow/", {
        username: Username,
        unfollow_username,
      });
      setIsFollowing(false);
      setProfile((p) =>
        p ? { ...p, follower_count: (p.follower_count || 1) - 1 } : p
      );
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  // --- Delete post ---
  const handleDelete = async (pdf_url) => {
    if (window.confirm("Are you sure you want to delete this repository?")) {
      try {
        await api.delete("/Profile/deletePost/", {
          data: { pdf_url: String(pdf_url), username: userToFetch },
        });
        setPosts(posts.filter((p) => p.pdf !== pdf_url));
      } catch (err) {
        console.error("Delete error:", err.response?.data || err.message);
        alert("Failed to delete repository.");
      }
    }
  };

  // Check if viewing own profile
  const isOwnProfile = !nameFromUrl || nameFromUrl === Username;

  return (
    <>
      <div className="bg-pattern"></div>
      <div className="mesh_profile ccf text-white pb-14 min-h-screen">
        <Navbar />
        <main className="flex flex-col items-center mt-10 justify-center px-4">
          <div className="w-full max-w-6xl mx-auto mt-10">
            {/* Loading */}
            {loading && (
              <div className="glass-card rounded-3xl m-3 p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full bg-gray-700/50 flex-shrink-0"></div>
                <div className="flex-1 flex flex-col items-center md:items-start w-full">
                  <div className="h-8 bg-gray-700/50 rounded-md w-2/3 md:w-1/3 mb-4"></div>
                  <div className="flex items-center justify-center gap-6 mt-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className="h-5 bg-gray-700/50 rounded-md w-8"></div>
                        <div className="h-4 bg-gray-700/50 rounded-md w-14"></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-4">
                    <div className="h-10 bg-gray-700/50 rounded-xl w-32"></div>
                    <div className="h-10 bg-gray-700/50 rounded-xl w-32"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="glass-card p-6 m-3 rounded-xl text-center text-red-400 font-bold">
                {error}
              </div>
            )}

            {/* Profile card */}
            {!loading && !error && profile && (
              <div className="glass-card rounded-3xl m-3 border border-white/20 bg-white/10 backdrop-blur-xl p-8 flex flex-col md:flex-row items-center gap-8">
                <div
                  className="relative cursor-pointer"
                  onClick={() => profile?.profile_pic && setIsPhotoModalOpen(true)}
                >
                  <img
                    className="w-32 h-32 rounded-full border-4 border-white/30 shadow-lg object-cover"
                    src={
                      profile?.profile_pic ||
                      "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png"
                    }
                    alt="Profile"
                  />
                  <span className="absolute bottom-2 right-2 bg-green-500/90 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md border border-white/20">
                    Active
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                  <h1 className="mb-2 text-4xl font-extrabold flex justify-center items-center gap-1 bg-gradient-to-tr from-blue-300 to-green-500 text-transparent bg-clip-text">
                    {profile?.username || "..."}
                    {verifiedUsernames.has(profile?.username) && (
                      <VerifiedBadge size={30} />
                    )}
                  </h1>
                  <div className="flex items-center justify-center gap-6 mt-2">
                    <div className="flex flex-col items-center text-center">
                      <p className="font-bold text-xl">
                        {profile?.post_count || posts.length}
                      </p>
                      <p className="text-sm text-gray-300">Posts</p>
                    </div>
                    <div
                      onClick={() => setPage("followers")}
                      className="flex flex-col items-center cursor-pointer text-center"
                    >
                      <p className="font-bold text-xl">
                        {profile?.follower_count || 0}
                      </p>
                      <p className="text-sm text-gray-300">Followers</p>
                    </div>
                    <div
                      onClick={() => setPage("following")}
                      className="flex flex-col items-center cursor-pointer text-center"
                    >
                      <p className="font-bold text-xl">
                        {profile?.following_count || 0}
                      </p>
                      <p className="text-sm text-gray-300">Following</p>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-4">
                    {isOwnProfile ? (
                      // Own profile - show edit and logout buttons
                      <>
                        <button
                          onClick={() => setPage("edit")}
                          className="glass-btn flex items-center gap-2 px-3 py-2 rounded-xl bg-white/30 hover:bg-white/50 text-black font-bold shadow transition"
                        >
                          <span className="material-symbols-outlined">
                            edit_square
                          </span>{" "}
                          Edit Profile
                        </button>
                        <button
                          onClick={() => navigate("/logout")}
                          className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500/80 hover:bg-red-600/90 text-white font-bold shadow transition"
                        >
                          <span className="material-symbols-outlined">
                            logout
                          </span>{" "}
                          Logout
                        </button>
                      </>
                    ) : (
                      // Other user's profile - show follow/unfollow and message buttons
                      <>
                        {isFollowing ? (
                          <button
                            onClick={() => unfollow(nameFromUrl)}
                            className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500/80 hover:bg-red-600/90 text-white font-bold shadow transition"
                          >
                            <span className="material-symbols-outlined">
                              person_remove
                            </span>{" "}
                            Unfollow
                          </button>
                        ) : (
                          <button
                            onClick={() => follow(nameFromUrl)}
                            className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-500/80 hover:bg-blue-600/90 text-white font-bold shadow transition"
                          >
                            <span className="material-symbols-outlined">
                              person_add
                            </span>{" "}
                            Follow
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/chat/${nameFromUrl}`)}
                          className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-white/20 hover:bg-white/40 text-white font-bold shadow transition"
                        >
                          <span className="material-symbols-outlined">chat</span>{" "}
                          Message
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-pages */}
            <Suspense
              fallback={
                <div className="flex justify-center items-center p-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              }
            >
              {page === "following" ? (
                <div className="glass-card rounded-3xl m-3 p-6">
                  <button
                    onClick={() => setPage(null)}
                    className="flex items-center gap-2 w-full max-w-max px-4 py-2 rounded-lg mb-4 bg-white/10 hover:bg-white/20 transition"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Profile
                  </button>
                  <FollowingPage username={profile?.username} />

                </div>

              ) : page === "followers" ? (
                <div className="glass-card rounded-3xl m-3 p-6">
                  <button
                    onClick={() => setPage(null)}
                    className="flex items-center gap-2 w-full max-w-max px-4 py-2 rounded-lg mb-4 bg-white/10 hover:bg-white/20 transition"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back to Profile
                  </button>
                  <FollowersPage username={profile?.username} />

                </div>
              ) : page === "edit" ? (
                <div className="glass-card rounded-3xl m-3 p-6">
                  <button
                    onClick={() => setPage(null)}
                    className="flex items-center gap-2 w-full max-w-max px-4 py-2 rounded-lg mb-4 bg-white/10 hover:bg-white/20 transition"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>{" "}
                    Back to Profile
                  </button>
                  <ProfileEditForm
                    profile={profile}
                    onUpdateSuccess={(updatedProfileData) => {
                      setProfile(updatedProfileData);
                      setPage(null);
                    }}
                  />
                </div>
              ) : (
                // Posts grid
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-white/90 mb-4 px-3 flex items-center gap-2">
                      <span className="material-symbols-outlined">
                        description
                      </span>{" "}
                      Notes
                    </h2>
                    <div className="space-y-4">
                      {posts.length === 0 ? (
                        <div className="glass-info p-6 m-3 rounded-xl text-center text-white/70">
                          {isOwnProfile
                            ? "You haven't posted any notes yet."
                            : "This user hasn't posted any notes yet."}
                        </div>
                      ) : (
                        posts.map((post) => (
                          <div
                            key={post.id}
                            className="glass-info p-5 m-3 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-lg shadow-lg hover:bg-white/15 transition-all duration-300"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-blue-400 mt-1">
                                  description
                                </span>
                                <div>
                                  <h3 className="font-bold text-lg text-white">
                                    {post.contant}
                                  </h3>
                                  <p className="font-medium text-sm text-gray-300 mt-1">
                                    {post.choose} in {post.sub} for Semester{" "}
                                    {post.sem}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-1">
                                <a
                                  href={post.pdf}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-500/80 text-white font-semibold flex items-center gap-1 transition"
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    download
                                  </span>{" "}
                                  PDF
                                </a>
                                {isOwnProfile && (
                                  <button
                                    onClick={() => handleDelete(post.pdf)}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-600/80 text-white font-semibold flex items-center gap-1 transition"
                                  >
                                    <span className="material-symbols-outlined text-sm">
                                      delete
                                    </span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div>

                  <NotFollowingBack />
                  <DownloadHistory />
                  </div>
                </div>
              )}
            </Suspense>
          </div>
        </main>
      </div>

      <Footer />
      <FloatingMessagesButton />

      {/* Profile picture modal */}
      {isPhotoModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <img
            src={profile?.profile_pic}
            alt="Profile full view"
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-5 right-5 text-white text-3xl"
            onClick={() => setIsPhotoModalOpen(false)}
          >
            &times;
          </button>
        </div>
      )}

      <style>{`
        .glass-card, .glass-info {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .glass-btn {
          backdrop-filter: blur(8px);
        }
      `}</style>
    </>
  );
};

export default Profile;
