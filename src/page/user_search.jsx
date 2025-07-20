import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../componet/Navbar"

export default function user_search() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://pixel-classes.onrender.com/api/Profile/UserSearch/");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <>
      <div className='bg-[radial-gradient(circle_at_top_left,_#111,_#1f1f2b,_#2c1f3c)] text-white  h-screen ccf overflow-y-scroll '>
        <Navbar />
        <div className="min-h-screen px-4 py-12 ">
          <div className="max-w-2xl mt-10 flex flex-col mb-10 items-center  mx-auto">
            <div className="mb-3">
            <input
              class="bg-[#222630] px-4 py-3 outline-none w-screen ml-0 min-w-full max-w-[280px] md:max-w-[280px] lg:max-w-[500px] text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or username..."
              value={search}
              type="text"
              />

              </div>

            <div className="space-y-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/20 transition-all"
                  >
                    <img
                      src={
                        user.profile_pic ||
                        `https://i.pravatar.cc/150?u=${user.username}`
                      }
                      alt={`${user.first_name} ${user.last_name}`}
                      className="w-12 h-12 rounded-full object-cover border border-white/30"
                    />
                    <div>
                      <div className="text-lg font-semibold">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-white/60">@{user.username}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/60 text-center">No users found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
