import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../componet/Navbar";
import Footer from "../componet/Footer";

import Cookies from "js-cookie";

export default function UserSearch() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const usernamec = Cookies.get("username");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
      const response = await axios.get("https://pixel-classes.onrender.com/api/Profile/UserSearch/", {
        params: { username: search }
      });
      // Remove user where username === usernamec
      const filtered = response.data.filter(user => user.username !== usernamec);
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
  }, [search]);

  // ✅ ADD THIS
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const username = user.username.toLowerCase();
    const searchTerm = search.toLowerCase();

    return (
      username.includes(searchTerm) ||
      fullName.includes(searchTerm)
    );
  });
  return (
    <>
      <div className="bg-pattern"></div>
      <div className="mesh_profile ccf text-white h-full min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center mt-10 justify-center">
          <div className="w-full max-w-4xl mt-10">
            <div className="max-w-2xl mt-10 flex flex-col mb-10 items-center justify-center">
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
  filteredUsers.map((user, index) => (
    search === usernamec ? (
      <span key={index}>You can't find yourself in this search page</span>
    ) : (
      <a key={index} href={`/profile?username=${user.username}`}>
        <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/20 transition-all">
          <img
            src={user.profile_pic || `https://i.pravatar.cc/150?u=${user.username}`}
            alt={`${user.first_name} ${user.last_name}`}
            className="w-12 h-12 rounded-full object-cover border border-white/30"
          />
          <div>
            <div className="text-lg font-semibold">{user.username}</div>
            <div className="text-sm text-white/60">
              {user.first_name} {user.last_name}
            </div>
          </div>
        </div>
      </a>
    )
  ))
   ) : search.trim() === "" ? (
                  <p className="text-white/60 text-center">Start typing to search users.</p>
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
