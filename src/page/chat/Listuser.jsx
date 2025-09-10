// Listuser.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { Undo2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import "../../new.css";

import api from "../../utils/api";

import { verifiedUsernames } from "../../verifiedAccounts";
import VerifiedBadge from "../../componet/VerifiedBadge";

function toISOStringCompat(dateString) {
  if (!dateString) return null;
  const [date, time] = dateString.split(" ");
  const fullTime = time?.length === 5 ? `${time}:00` : time;
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
  const USERNAME = " ";
  const wsToken = ""// assume you set token in cookies
  const wsRef = useRef(null);

  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 Filter users by search
  const filteredUsers = useMemo(() => {
    const searchTerm = search.toLowerCase();
    return allUsers.filter((user) => {
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
      return (
        user.username.includes(searchTerm) ||
        fullName.includes(searchTerm)
      );
    });
  }, [allUsers, search]);

  // 🛰️Connect WebSocket
  useEffect(() => {
    let ws;
    let loadTimeout;

    const connectWS = async () => {
      try {
        // Step 1: Get short-lived WS token
        const res = await api.get("/ws-token/", {
          withCredentials: true, // sends cookies (refresh/access token)
        });
        const wsToken = res.data.ws_token;

        // Step 2: Open WebSocket with token
        ws = new WebSocket(
          `wss://pixel-classes.onrender.com/ws/message-inbox/?token=${wsToken}`
        );
        wsRef.current = ws;

        // fallback loader timeout
        loadTimeout = setTimeout(() => {
          console.warn("⏳ No inbox_list received, stopping loader.");
          setLoading(false);
        }, 5000);

        ws.onopen = () => {
          console.log("✅ WS connected");
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === "inbox_list") {
            clearTimeout(loadTimeout);
            const sorted = [...data.inbox].sort(
              (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
            );
            setAllUsers(sorted);
            setLoading(false);
          }

          if (data.type === "inbox_update") {
            setAllUsers((prev) => {
              const updated = prev.filter((u) => u.username !== data.user.username);
              return [
                {
                  ...data.user,
                  lastMessage: data.latest_message,
                  lastTime: data.timestamp,
                  isSeen: data.is_seen,
                },
                ...updated,
              ].sort(
                (a, b) => new Date(b.lastTime || 0) - new Date(a.lastTime || 0)
              );
            });
          }
        };


        ws.onerror = (err) => {
          console.error("❌ WS error", err);
          clearTimeout(loadTimeout);
          setLoading(false);
        };

        ws.onclose = () => {
          console.log("🔌 WS closed");
          clearTimeout(loadTimeout);
          setLoading(false);
        };
      } catch (err) {
        console.error("❌ Failed to fetch ws-token", err);
        setLoading(false);
      }
    };

    connectWS();

    return () => {
      clearTimeout(loadTimeout);
      if (ws) ws.close();
    };
  }, []);


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
                    onClick={() => navigate(`/chat/${user.username}`)}
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
                        {user.timestamp && (
                          <span className="text-xs text-white/40 flex-shrink-0 ml-2">
                            {new Date(
                              toISOStringCompat(user.timestamp)
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm truncate max-w-36 ${user.lastSender !== USERNAME && !user.isSeen
                            ? "text-white font-semibold"
                            : "text-white/60"
                          }`}
                      >
                        {user.lastSender === USERNAME && user.latest_message
                          ? `You: ${user.latest_message}`
                          : user.latest_message ||
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
