import { useEffect, useState, useMemo, useCallback } from "react";
import { Undo2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import "../../new.css";

const API_BASE = "https://pixel-classes.onrender.com/api";

// ✅ Utility function (moved outside for stability)
function toISOStringCompat(dateString) {
  if (!dateString) return null;
  const [date, time] = dateString.split(" ");
  const fullTime = time.length === 5 ? `${time}:00` : time;
  return `${date}T${fullTime}`;
}

export default function Listuser() {
  const location = useLocation();
  const navigate = useNavigate();

  const RECEIVER = new URLSearchParams(location.search).get("username");
  const USERNAME = Cookies.get("username");
  const token = Cookies.get("access_token");

  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  // ✅ Prefill message state
  const [prefillMessage, setPrefillMessage] = useState("");
  useEffect(() => {
    const msg = new URLSearchParams(location.search).get("prefillMessage");
    if (msg) setPrefillMessage(decodeURIComponent(msg));
  }, [location.search]);

  // ✅ Memoized search filter
  const filteredUsers = useMemo(() => {
    const searchTerm = search.toLowerCase();
    return allUsers.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      return (
        user.username.toLowerCase().includes(searchTerm) ||
        fullName.includes(searchTerm)
      );
    });
  }, [allUsers, search]);

  // ✅ Fetch user data
  const fetchUsers = useCallback(async () => {
    if (!USERNAME) return;

    try {
      const [followingRes, followersRes] = await Promise.all([
        axios.post(`${API_BASE}/Profile/following/`, { username: USERNAME }),
        axios.post(`${API_BASE}/Profile/followers/`, { username: USERNAME }),
      ]);

      const combined = [...followersRes.data, ...followingRes.data];
      const deduplicated = Array.from(
        new Map(combined.map((u) => [u.username, u])).values()
      );

      const updated = await Promise.all(
        deduplicated.map(async (user) => {
          try {
            const roomName = [USERNAME, user.username].sort().join("__");
            const res = await fetch(`${API_BASE}/chatting/${roomName}/`);
            const messages = await res.json();
            const lastMsg = messages.at(-1);

            return {
              ...user,
              lastMessage: lastMsg?.content || "",
              lastTime: lastMsg?.timestamp || null,
              lastSender: lastMsg?.sender || null,
              isSeen: lastMsg ? lastMsg.is_seen : true,
            };
          } catch {
            return { ...user, lastMessage: "", lastTime: null, isSeen: true };
          }
        })
      );

      updated.sort(
        (a, b) => new Date(b.lastTime || 0) - new Date(a.lastTime || 0)
      );
      setAllUsers(updated);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [USERNAME]);

  // ✅ Poll every 60s
  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 60000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  // ✅ Fetch profile details
  useEffect(() => {
    if (!token) return navigate("/");
    if (!RECEIVER) return;

    axios
      .post(`${API_BASE}/Profile/details/`, { username: RECEIVER })
      .then((res) => setProfile(res.data))
      .catch(() => setError("Failed to load profile details"));
  }, [RECEIVER, token, navigate]);

  // ✅ Follow function (simplified)
  const follow = async (targetUsername) => {
    try {
      await axios.post(`${API_BASE}/Profile/follow/`, {
        follower: USERNAME,
        following: targetUsername,
      });
    } catch (err) {
      console.error("Follow failed:", err);
    }
  };

  // ---------------- UI ----------------
  if (loading) {
    return (
      <div className="min-h-screen ccf flex m-3  items-center justify-center text-white/60">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-max ccf flex flex-col text-white">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900 flex items-center gap-3 px-4 py-3 border-b border-gray-700 z-10">
        <button onClick={() => navigate("/profile")} className="p-2">
          <Undo2 className="text-white" />
        </button>
        <h1 className="text-xl font-semibold">Messages</h1>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col mb-19 overflow-y-auto">
        {allUsers.length === 0 ? (
          <div className="text-white/60 p-4">
            <p>You’re not following anyone yet.</p>
            <a href="/search">
              <button className="bg-white/10 hover:bg-white/20 rounded-full py-2 px-4 text-white/80 text-sm mt-2">
                Find Friends
              </button>
            </a>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="mb-3 flex justify-center">
              <input
                className="bg-[#222630] px-4 py-3 outline-none w-full m-2 max-w-[90%] text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username..."
                value={search}
                type="text"
              />
            </div>

            {/* Users list */}
            <div className="flex flex-col">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) =>
                  user.username === USERNAME ? (
                    <span key={user.username} className="text-center text-white/60">
                      You can’t find yourself here.
                    </span>
                  ) : (
                    <a
                      key={user.username}
                      href={`/chat/${user.username}`}
                      className="p-4 shadow backdrop-blur-md border-y border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all"
                    >
                      <img
                        src={
                          user.profile_pic ||
                          `https://i.pravatar.cc/150?u=${user.username}`
                        }
                        alt={user.username}
                        className="w-9 h-9 lg:w-14 lg:h-14 rounded-full border-2 border-white/20 object-cover"
                      />
                      <div className="flex flex-col flex-1 max-w-full">
                        <span className="font-semibold">{user.username}</span>
                        <span className="text-sm text-white/60 truncate block max-w-[220px]">
                          {user.lastMessage || `${user.first_name} ${user.last_name}`}
                        </span>
                      </div>
                      <div className="min-w-11 flex gap-2 items-center">
                        {/* Blue dot */}
                        {user.lastSender &&
                          user.lastSender !== USERNAME &&
                          !user.isSeen && (
                            <span className="w-3 h-3 rounded-full bg-blue-500 ml-2 inline-block" />
                          )}
                        {/* Timestamp */}
                        {user.lastTime && (
                          <span className="text-xs text-white/40">
                            {new Date(
                              toISOStringCompat(user.lastTime)
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    </a>
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
          </>
        )}
      </div>
    </div>
  );
}
