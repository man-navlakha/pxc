import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../componet/Navbar";
import Footer from "../componet/Footer";

import Cookies from "js-cookie";

export default function UserSearch() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const usernamec = Cookies.get("username");

  // Move follow function outside useEffect so it can be used in JSX
  const follow = async (follow_username) => {
    try {
      const response = await axios.post(
        "https://pixel-classes.onrender.com/api/Profile/follow/",
        {
          username: usernamec,
          follow_username: follow_username,
        }
      );
      console.log("Follow response:", response.data);
      if (response.data.message) {
        alert(`You are now following ${follow_username}`);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.username === follow_username
              ? { ...user, is_following: true }
              : user
          )
        );
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };
  // Move follow function outside useEffect so it can be used in JSX
 const unfollow = async (unfollow_username) => {
  try {
    const response = await axios.post(
      "https://pixel-classes.onrender.com/api/Profile/unfollow/",
      {
        username: usernamec,
        unfollow_username: unfollow_username, // <-- send the follow relationship ID
      }
    );
    console.log("Unfollow response:", response.data);
    if (response.data.message) {
      alert(`removed`);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.follow_id === follow_id
            ? { ...user, is_following: false }
            : user
        )
      );
    }
  } catch (error) {
    console.error("Error unfollow user:", error);
  }
};
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // 1. Get following list
        const followingRes = await axios.post(
          "https://pixel-classes.onrender.com/api/Profile/following/",
          { username: usernamec }
        );
        const followingUsernames = followingRes.data.map((u) => u.username);

        // 2. Get user search results
        const response = await axios.get(
          "https://pixel-classes.onrender.com/api/Profile/UserSearch/",
          { params: { username: search } }
        );
        // 3. Remove self and set is_following
        const filtered = response.data
          .filter((user) => user.username !== usernamec)
          .map((user) => ({
            ...user,
            is_following: followingUsernames.includes(user.username),
          }));
        setUsers(filtered);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (search.trim()) {
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [search, usernamec]);

  // ✅ ADD THIS
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const username = user.username.toLowerCase();
    const searchTerm = search.toLowerCase();

    return username.includes(searchTerm) || fullName.includes(searchTerm);
  });
  return (
    <>
      <div className="bg-pattern"></div>
      <div className="mesh_profile ccf text-white h-full min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center mt-10 justify-center">
          <div className="w-full max-w-4xl mt-10">
            <div className="max-w-4xl mt-10 flex flex-col mb-10 items-center justify-center">
              <div className="mb-3">
                <input
                  className="bg-[#222630] px-4 py-3 outline-none w-screen m-2 min-w-full max-w-[310px] md:max-w-[380px] lg:max-w-[500px] text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by username..."
                  value={search}
                  type="text"
                />
              </div>

              <div className="space-y-4 flex flex-col w-full px-4">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) =>
                    search === usernamec ? (
                      <span key={index}>
                        You can't find yourself in this search page
                      </span>
                    ) : (
                      <div className="flex items-center justify-between gap-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/20 transition-all">
                        <a
                          key={index}
                          href={`profile?username=${user.username}`}
                        >
                          <div className="flex items-center justify-center gap-4">
                            <img
                              src={
                                user.profile_pic ||
                                `https://i.pravatar.cc/150?u=${user.username}`
                              }
                              alt={`${user.first_name} ${user.last_name}`}
                              className="w-12 h-12 rounded-full object-cover border border-white/30"
                            />
                            <div className="flex flex-col items-center justify-between">
                              <div>
                                <div className="text-lg font-semibold max-w-[150px] truncate">
                                  {user.username}
                                </div>
                                <div className="text-sm text-white/60 max-w-[180px] truncate">
                                  {user.first_name} {user.last_name}
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                        {user.is_following ? (
                          <button
                            onClick={() => unfollow(user.username)}
                            className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500/80 hover:bg-red-600/90 text-white font-bold shadow transition"
                          >
                            <span className="material-symbols-outlined">
                              person_remove
                            </span>{" "}
                            Unfollow
                          </button>
                        ) : (
                          <button
                            onClick={() => follow(user.username)}
                            className="glass-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-500/80 hover:bg-blue-600/90 text-white font-bold shadow transition"
                          >
                            <span className="material-symbols-outlined">
                              person_add
                            </span>{" "}
                            Follow
                          </button>
                        )}
                      </div>
                      
                    )
                  )
                ) : search.trim() === "" ? (
                  <p className="text-white/60 text-center">
                    Start typing to search users.
                  </p>
                ) : (
                  <p className="text-white/60 text-center">No users found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Optional Glassmorphism Classes */}
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
  );
}
