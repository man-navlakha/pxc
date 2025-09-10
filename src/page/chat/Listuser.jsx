// Listuser.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { Undo2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "../../new.css";
import { verifiedUsernames } from "../../verifiedAccounts";
import VerifiedBadge from "../../componet/VerifiedBadge";
import api from "../../utils/api"; // ✅ central axios instance

function toISOStringCompat(dateString) {
  if (!dateString) return null;
  const [date, time] = dateString.split(" ");
  const fullTime = time.length === 5 ? `${time}:00` : time;
  return `${date}T${fullTime}`;
}

// Skeleton Loader
const ChatUserSkeleton = () => (
  <div className="flex items-center gap-4 p-4 w-full animate-pulse">
    <div className="w-14 h-14 rounded-full bg-white/10"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 w-1/2 rounded bg-white/10"></div>
      <div className="h-3 w-3/4 rounded bg-white/10"></div>
    </div>
  </div>
);

// Empty State
const EmptyState = ({ onFindFriendsClick }) => (
  <div className="text-center py-20 text-white/60">
    <span className="material-symbols-outlined text-6xl text-white/20">
      chat_bubble
    </span>
    <h3 className="mt-4 text-xl font-bold text-white/80">No Conversations Yet</h3>
    <p className="mt-1">You’re not following or followed by anyone yet.</p>
    <button
      onClick={onFindFriendsClick}
      className="mt-6 bg-white/10 hover:bg-white/20 rounded-lg py-2 px-4 text-white/80 text-sm font-semibold transition-colors"
    >
      Find Friends
    </button>
  </div>
);

export default function Listuser() {
  const navigate = useNavigate();
  const USERNAME = Cookies.get("username");

  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const filteredUsers = useMemo(() => {
    const searchTerm = search.toLowerCase();
    return allUsers.filter((user) => {
      const fullName = `${user.first_name || ""} ${
        user.last_name || ""
      }`.toLowerCase();
      return (
        user.username.toLowerCase().includes(searchTerm) ||
        fullName.includes(searchTerm)
      );
    });
  }, [allUsers, search]);

  const fetchUsers = useCallback(async () => {
    if (!USERNAME) {
      toast.error("No username found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [followingRes, followersRes] = await Promise.all([
        api.post("/Profile/following/", { username: USERNAME }),
        api.post("/Profile/followers/", { username: USERNAME }),
      ]);

      const combined = [...followersRes.data, ...followingRes.data];
      const deduplicated = Array.from(
        new Map(combined.map((u) => [u.username, u])).values()
      );

      const updated = await Promise.all(
        deduplicated.map(async (user) => {
          try {
            const roomName = [USERNAME, user.username].sort().join("__");
            const res = await api.get(`/chatting/${roomName}/`);
            const messages = res.data;
            const lastMsg = messages.at(-1);
            return {
              ...user,
              lastMessage: lastMsg?.content || "",
              lastTime: lastMsg?.timestamp || null,
              lastSender: lastMsg?.sender || null,
              isSeen: lastMsg ? lastMsg.is_seen : true,
            };
          } catch (err) {
            console.warn("Chat fetch failed for", user.username, err);
            return { ...user, lastMessage: "", lastTime: null, isSeen: true };
          }
        })
      );

      updated.sort(
        (a, b) => new Date(b.lastTime || 0) - new Date(a.lastTime || 0)
      );
      setAllUsers(updated);
    } catch (err) {
      toast.error("Failed to load conversations.");
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  }, [USERNAME]);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 60000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  return (
    <div className="min-h-screen ccf flex flex-col text-white bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-gray-900/70 backdrop-blur-lg flex items-center gap-3 px-4 py-3 border-b border-white/10 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <Undo2 className="text-white" />
        </button>
        <h1 className="text-xl font-semibold">Messages</h1>
      </header>

      <main className="flex-1 flex flex-col p-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <ChatUserSkeleton key={i} />
            ))}
          </div>
        ) : allUsers.length === 0 ? (
          <EmptyState onFindFriendsClick={() => navigate("/search")} />
        ) : (
          <div className="flex flex-col h-full">
            {/* Search */}
            <div className="relative mb-4">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                search
              </span>
              <input
                className="w-full bg-white/5 pl-12 pr-4 py-3 text-white rounded-xl border-2 border-transparent focus:border-blue-500 transition-colors duration-300 outline-none"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                value={search}
                type="text"
              />
            </div>

            {/* Users list */}
            <motion.div layout className="flex flex-col overflow-y-auto">
              <AnimatePresence>
                {filteredUsers.map((user) => (
                  <motion.div
                    layout
                    key={user.username}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={() => navigate(`/chat/${user.username}`)} // ✅ no reload
                    className="cursor-pointer p-3 rounded-lg flex items-center gap-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="relative">
                      <img
                        src={
                          user.profile_pic ||
                          `https://i.pravatar.cc/150?u=${user.username}`
                        }
                        alt={user.username}
                        className="w-14 h-14 rounded-full border-2 border-white/20 object-cover"
                      />
                      {user.lastSender &&
                        user.lastSender !== USERNAME &&
                        !user.isSeen && (
                          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-gray-900" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold truncate flex items-center gap-1">
                          {user.username}
                          {verifiedUsernames.has(user?.username) && (
                            <VerifiedBadge size={20} />
                          )}
                        </span>
                        {user.lastTime && (
                          <span className="text-xs text-white/40 flex-shrink-0 ml-2">
                            {new Date(
                              toISOStringCompat(user.lastTime)
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm truncate max-w-36 ${
                          user.lastSender !== USERNAME && !user.isSeen
                            ? "text-white font-semibold"
                            : "text-white/60"
                        }`}
                      >
                        {user.lastSender === USERNAME && user.lastMessage && "You: "}
                        {user.lastMessage ||
                          `${user.first_name || ""} ${user.last_name || ""}`}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
