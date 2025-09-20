import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Undo2, Search, Users, Bell, Check } from "lucide-react"; // removed invalid CheckCheck
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../../new.css";

import api from "../../utils/api";
import { verifiedUsernames } from "../../verifiedAccounts";
import VerifiedBadge from "../../componet/VerifiedBadge";

// Helpers
function toISOStringCompat(input) {
  // Normalize many possible input shapes into a reliable ISO string, or return null
  if (!input && input !== 0) return null;

  // Date instance
  if (input instanceof Date) {
    const t = input.getTime();
    return isNaN(t) ? null : new Date(t).toISOString();
  }

  // Numeric timestamp (seconds or ms). If seconds (10 digits) convert to ms
  if (typeof input === "number") {
    const millis = input > 1e12 ? input : input * 1000; // tolerant guess
    const d = new Date(millis);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  // If the server sends an object wrapper with a timestamp field
  if (typeof input === "object") {
    const candidate = input.timestamp ?? input.created_at ?? input.time ?? input.date ?? null;
    if (candidate == null) return null;
    return toISOStringCompat(candidate);
  }

  // Strings
  if (typeof input === "string") {
    // quick guard: empty
    const s = input.trim();
    if (!s) return null;

    // If it already looks like ISO-ish, attempt to parse and re-ISO
    if (s.includes("T") || s.includes("Z")) {
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d.toISOString();
    }

    // Common server format: "YYYY-MM-DD HH:MM" or "YYYY-MM-DD HH:MM:SS"
    if (s.match(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/)) {
      const isoLike = s.replace(/\s+/, "T");
      const d = new Date(isoLike);
      return isNaN(d.getTime()) ? null : d.toISOString();
    }

    // Fallback try Date.parse
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  return null;
}

function getLatestMessageText(latest) {
  if (!latest) return "";
  if (typeof latest === "string") return latest;
  // support multiple payload shapes
  return (
    latest?.text ??
    latest?.message ??
    latest?.content ??
    latest?.body ??
    (typeof latest === "object" ? JSON.stringify(latest).slice(0, 120) : "")
  );
}

// Small presentational components
const MessageStatus = ({ isOwnMessage, seenByOther }) => {
  if (!isOwnMessage) return null;
  return (
    <span className="flex items-center ml-2">
      {seenByOther ? (
        <span title="Seen" className="flex gap-0.5 items-center">
          <Check size={12} className="text-green-400" />
          <Check size={12} className="text-green-400" />
        </span>
      ) : (
        <Check size={14} className="text-white/50" title="Sent" />
      )}
    </span>
  );
};



const UnreadBadge = ({ count, isVisible }) => {
  if (!isVisible || !count) return null;
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="absolute right-5 h-2 w-2 px-1 rounded-full bg-blue-800 text-xs font-bold flex items-center justify-center"
    >
      {/* {count > 99 ? "99+" : count} */}
    </motion.span>
  );
};

const ChatUserSkeleton = () => (
  <div className="flex items-center gap-4 p-4 w-full bg-white/3 backdrop-blur-md rounded-2xl border border-white/5">
    <div className="relative">
      <div className="w-14 h-14 rounded-full bg-white/10 animate-pulse" />
    </div>
    <div className="flex-1 space-y-2">
      <div className="h-4 w-1/2 rounded bg-white/10 animate-pulse" />
      <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
    </div>
  </div>
);

const EmptyState = ({ onFindFriendsClick }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 text-white/60">
    <div className="w-48 h-48 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-black/40 to-white/5 backdrop-blur-md border border-white/5">
      <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>

    <h3 className="mt-4 text-xl font-bold text-white/80">No conversations yet</h3>
    <p className="mt-1 max-w-md mx-auto">Start a conversation by connecting with other users or finding friends.</p>
    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
      <button onClick={onFindFriendsClick} className="bg-green-600 hover:bg-green-700 rounded-lg py-3 px-6 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
        <Users size={16} />
        Find Friends
      </button>
      <button onClick={() => window.location.reload()} className="bg-white/5 hover:bg-white/10 rounded-lg py-3 px-6 text-white/80 text-sm font-semibold transition-colors">
        Refresh
      </button>
    </div>
  </motion.div>
);

export default function Listuser() {
  const navigate = useNavigate();

  // current user info
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const listRef = useRef(null);

  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pullToRefresh, setPullToRefresh] = useState({ active: false, startY: 0, distance: 0 });
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Fetch current user details (username AND id)
  useEffect(() => {
    let mounted = true;
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const details = await api.post("/Profile/details/", { username: undefined });
        if (!mounted) return;
        const data = details.data || {};
        if (data.username) setCurrentUsername(data.username);
        if (data.id || data.user_id || data.pk) setCurrentUserId(data.id ?? data.user_id ?? data.pk);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Unknown error";
        setError(errorMessage);
        console.error("Failed to fetch user details:", err.response?.data || err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUserDetails();
    return () => { mounted = false; };
  }, []);

  // Filter + sorting: unread first, then timestamp desc (SEARCH ONLY)
  const filteredUsers = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();
    let filtered = allUsers.filter((user) => {
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
      const username = (user.username || "").toLowerCase();
      const matchesSearch = !searchTerm || username.includes(searchTerm) || fullName.includes(searchTerm);
      return matchesSearch;
    });

    filtered.sort((a, b) => {
      if (a.hasUnread && !b.hasUnread) return -1;
      if (!a.hasUnread && b.hasUnread) return 1;
      // If timestamps missing, treat as older
      const ta = a.timestamp ? new Date(toISOStringCompat(a.timestamp)).getTime() : 0;
      const tb = b.timestamp ? new Date(toISOStringCompat(b.timestamp)).getTime() : 0;
      return tb - ta;
    });

    return filtered;
  }, [allUsers, search]);

  const unreadConversationsCount = useMemo(() => allUsers.filter(u => u.hasUnread).length, [allUsers]);

  // Pull-to-refresh handlers (kept but trimmed)
  const handleTouchStart = useCallback((e) => {
    if (listRef.current && listRef.current.scrollTop === 0) {
      setPullToRefresh({ active: true, startY: e.touches[0].clientY, distance: 0 });
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!pullToRefresh.active) return;
    const distance = e.touches[0].clientY - pullToRefresh.startY;
    if (distance > 0) setPullToRefresh(prev => ({ ...prev, distance: Math.min(distance, 80) }));
  }, [pullToRefresh.active, pullToRefresh.startY]);

  const handleTouchEnd = useCallback(() => {
    if (pullToRefresh.active && pullToRefresh.distance > 50) {
      setRefreshing(true);
      // keep UX snappy, trigger a refresh message to the server via WS (if available)
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "refresh_inbox" }));
      }
      setTimeout(() => {
        setRefreshing(false);
        setPullToRefresh({ active: false, startY: 0, distance: 0 });
      }, 800);
    } else {
      setPullToRefresh({ active: false, startY: 0, distance: 0 });
    }
  }, [pullToRefresh.active, pullToRefresh.distance]);

  // WebSocket connection and message handling.
  // Important: only start processing when we at least have a username or user id available.
  useEffect(() => {
    if (!currentUsername && currentUserId == null) return; // wait until we have identification

    let ws;
    let loadTimeout;
    let mounted = true;

    const connectWS = async () => {
      try {
        const res = await api.get("/ws-token/", { withCredentials: true });
        const wsToken = res.data?.ws_token;
        if (!wsToken) throw new Error("No ws token");

        ws = new WebSocket(`wss://pixel-classes.onrender.com/ws/message-inbox/?token=${wsToken}`);
        wsRef.current = ws;


        ws.onopen = () => {
          console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // Helper to process a single user payload into our ui model
            // currentUsername is from state (ensure closure captures it)
const processUser = (u) => {
  // backend now returns u.latest_message as an object OR null
  const latest = (u.latest_message && typeof u.latest_message === "object") ? u.latest_message : null;

  // server-provided unread_count takes priority if present
  const serverUnread = u.unread_count ?? null;

  // Determine whether the latest message was sent by the current user
  const isOwnMessage = !!(latest && latest.sender_username && String(latest.sender_username) === String(currentUsername));

  // If I sent the last message, seenByOther := whether the other person has seen it
  const seenByOther = isOwnMessage ? !!latest?.is_seen : null;

  // Compute hasUnread / unreadCount:
  let hasUnread = false;
  let unreadCount = 0;
  if (serverUnread != null) {
    hasUnread = Number(serverUnread) > 0;
    unreadCount = Number(serverUnread);
  } else if (latest) {
    if (isOwnMessage) {
      // I sent last -> it's not "unread for me"
      hasUnread = false;
      unreadCount = 0;
    } else {
      // They sent last -> it's unread for me if I haven't seen it
      const seenByMe = !!latest?.is_seen; // backend 'is_seen' on latest_msg means receiver has seen it
      hasUnread = !seenByMe;
      unreadCount = hasUnread ? 1 : 0;
    }
  }

  return {
    username: u.username,
    profile_pic: u.profile_pic,
    first_name: u.first_name ?? "",
    last_name: u.last_name ?? "",
    latest_message: latest ? latest : u.latest_message, // keep shape for your getLatestMessageText
    timestamp: u.timestamp ?? (latest && latest.timestamp) ?? null,
    isOwnMessage,
    seenByOther,
    hasUnread,
    unreadCount,
    is_online: u.is_online ?? false,
  };
};





            // Full inbox payload
            if (data.type === "inbox_data" && Array.isArray(data.inbox)) {
              clearTimeout(loadTimeout);
              const processed = data.inbox.map(u => processUser(u));

              // sort reliably by timestamp (missing timestamps become 0)
              const sorted = processed.sort((a, b) => {
                const ta = a.timestamp ? new Date(toISOStringCompat(a.timestamp)).getTime() : 0;
                const tb = b.timestamp ? new Date(toISOStringCompat(b.timestamp)).getTime() : 0;
                if (a.hasUnread && !b.hasUnread) return -1;
                if (!a.hasUnread && b.hasUnread) return 1;
                return tb - ta;
              });

              if (mounted) {
                setAllUsers(sorted);
                setLoading(false);
              }
            }

            // Single update
            if (data.type === "inbox_update" && data.user) {
              setAllUsers(prev => {
                const updated = processUser({ ...(data.user || {}), latest_message: data.latest_message, unread_count: data.unread_count, is_seen: data.is_seen }, { timestamp: data.timestamp });

                const copy = prev.filter(p => p.username !== updated.username);
                copy.unshift(updated);
                copy.sort((a, b) => {
                  const ta = a.timestamp ? new Date(toISOStringCompat(a.timestamp)).getTime() : 0;
                  const tb = b.timestamp ? new Date(toISOStringCompat(b.timestamp)).getTime() : 0;
                  if (a.hasUnread && !b.hasUnread) return -1;
                  if (!a.hasUnread && b.hasUnread) return 1;
                  return tb - ta;
                });
                return copy;
              });
            }

            if (data.type === "total_unread_update") {
              setTotalUnreadCount(data.total_unread_count ?? 0);
            }

          } catch (err) {
            console.error("Failed to parse ws message", err);
          }
        };

        ws.onerror = (err) => {
          console.error("WebSocket error", err);
          clearTimeout(loadTimeout);
          if (mounted) setLoading(false);
        };

        ws.onclose = () => {
          console.log("WebSocket closed");
          clearTimeout(loadTimeout);
          if (mounted) setLoading(false);
        };

      } catch (err) {
        console.error("Failed to connect WS", err);
        if (mounted) setLoading(false);
      }
    };

    connectWS();

    return () => {
      mounted = false;
      clearTimeout(loadTimeout);
      if (ws) ws.close();
    };
  }, [currentUsername, currentUserId]);

  const handleChatNavigation = useCallback((username) => {
    navigate(`/chat/${username}`);
  }, [navigate]);

  return (
    <div className="min-h-screen ccf flex flex-col text-white bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-black/60 backdrop-blur-md flex items-center gap-3 px-4 py-3 border-b border-white/5 z-10">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-white/6 transition-colors" aria-label="Go back">
          <Undo2 size={20} />
        </button>

        <div className="flex-1">
          <h1 className="text-xl font-semibold">Messages</h1>
          {/* {unreadConversationsCount > 0 && (
            <p className="text-xs text-green-400">{unreadConversationsCount} unread conversation{unreadConversationsCount > 1 ? 's' : ''}</p>
          )} */}
        </div>


      </header>

      <main ref={listRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="flex-1 flex flex-col p-4">
        {/* Pull to refresh indicator */}
        <div className="overflow-hidden" style={{ height: pullToRefresh.distance }}>
          <div className="flex items-center justify-center h-12">
            {pullToRefresh.distance > 50 ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.99994L16.25 7.82837M4.92157 19.0784L7.75 16.25M4.92157 4.99994L7.75 7.82837" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </motion.div>
            ) : (
              <span className="text-white/60">Pull to refresh</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <ChatUserSkeleton key={i} />)}
          </div>
        ) : allUsers.length === 0 ? (
          <EmptyState onFindFriendsClick={() => navigate('/search')} />
        ) : (
          <div className="flex flex-col h-full">
            {/* Search */}
            <div className="relative mb-4">
              {/* <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} /> */}
              <input className="w-full bg-gray-700 pl-4 pr-4 py-3 text-white rounded-2xl border border-black backdrop-blur-md focus:border-green-400 transition-colors duration-300 outline-none placeholder:text-white/30" onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations by name or username..." value={search} type="text" />
            </div>

            {/* List */}
            <motion.div layout className="flex-1 overflow-y-auto space-y-3 pr-2">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user, idx) => {
                  const key = user.username ?? user.user_id ?? user.id ?? `user-${idx}`;
                  // compute time string safely
                  const iso = toISOStringCompat(user.timestamp ?? user.latest_message?.timestamp ?? user.latest_message?.created_at ?? null);
                  let timeString = "";
                  if (iso) {
                    const d = new Date(iso);
                    if (!isNaN(d.getTime())) timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }

                  return (
                    <motion.div key={user.username} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} onClick={() => handleChatNavigation(user.username)} className={`cursor-pointer p-3 rounded-2xl flex items-center gap-4 transition-colors ${user.hasUnread ? 'bg-white/6 ' : 'bg-white/3'}  border border-white/5 backdrop-blur-md`}>

                      <div className="relative">
                        <img src={user.profile_pic || `https://i.pravatar.cc/150?u=${user.username}`} alt={user.username} className="w-14 h-14 rounded-full object-cover border-1 border-black" />

                        {user.is_online && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-black" />}

                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-semibold truncate flex items-center gap-2 ${user.hasUnread ? 'text-white' : 'text-white/60'}`}>
                            <span className="flex items-center gap-2">
                              {user.username}
                              {verifiedUsernames.has(user?.username) && <VerifiedBadge size={16} />}
                            </span>
                          </span>

                          {timeString && (
                            <span className="text-xs text-white/40 flex-shrink-0 ml-2">{timeString}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate flex-1 ${user.hasUnread ? 'text-white/80 font-medium' : 'text-white/60'}`}>
                            {user.isOwnMessage && user.latest_message ? `You: ${getLatestMessageText(user.latest_message)}` : getLatestMessageText(user.latest_message) || `${user.first_name || ''} ${user.last_name || ''}`.trim()}
                          </p>
                          <UnreadBadge count={user.unreadCount || 0} isVisible={user.hasUnread} />

                          <MessageStatus isOwnMessage={user.isOwnMessage} seenByOther={user.seenByOther} />
<UnreadBadge count={user.unreadCount || 0} isVisible={user.hasUnread} />


                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredUsers.length === 0 && (
                <div className="text-center py-10 text-white/40">No conversations found {search ? `for \"${search}\"` : ``}</div>
              )}
            </motion.div>

          </div>
        )}
      </main>
    </div>
  );
}
