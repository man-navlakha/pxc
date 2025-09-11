// Listuser.jsx
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Undo2, Search, Users, Filter, Bell, Check, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

// Skeleton Loader - Improved with better animation
const ChatUserSkeleton = () => (
  <div className="flex items-center gap-4 p-4 w-full">
    <div className="relative">
      <div className="w-14 h-14 rounded-full bg-white/10 animate-pulse"></div>
    </div>
    <div className="flex-1 space-y-2">
      <div className="h-4 w-1/2 rounded bg-white/10 animate-pulse"></div>
      <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse"></div>
    </div>
  </div>
);

// Empty State - Enhanced with illustration and options
const EmptyState = ({ onFindFriendsClick }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-20 text-white/60"
  >
    <div className="w-48 h-48 mx-auto mb-6 flex items-center justify-center rounded-full bg-white/5">
      <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <h3 className="mt-4 text-xl font-bold text-white/80">No conversations yet</h3>
    <p className="mt-1 max-w-md mx-auto">Start a conversation by connecting with other users or finding friends.</p>
    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
      <button
        onClick={onFindFriendsClick}
        className="bg-blue-600 hover:bg-blue-700 rounded-lg py-3 px-6 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <Users size={16} />
        Find Friends
      </button>
      <button
        onClick={() => window.location.reload()}
        className="bg-white/10 hover:bg-white/20 rounded-lg py-3 px-6 text-white/80 text-sm font-semibold transition-colors"
      >
        Refresh
      </button>
    </div>
  </motion.div>
);

// Message Status Icon
const MessageStatus = ({ status, isOwnMessage }) => {
  if (!isOwnMessage) return null;
  
  switch(status) {
    case 'sent':
      return <Check size={14} className="text-white/40" />;
    case 'delivered':
      return <CheckCheck size={14} className="text-white/40" />;
    case 'read':
      return <CheckCheck size={14} className="text-blue-400" />;
    default:
      return <Check size={14} className="text-white/40" />;
  }
};

export default function Listuser() {
  const navigate = useNavigate();
 const [USERNAME, setUSERNAME] = useState("");
  const [error, setError] = useState(null); // This should be replaced with actual username
  const wsRef = useRef(null);
  const listRef = useRef(null);

  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread', 'groups'
  const [refreshing, setRefreshing] = useState(false);
  const [pullToRefresh, setPullToRefresh] = useState({ active: false, startY: 0, distance: 0 });


  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try different endpoint variations based on your API
        const details = await api.get(`/Profile/details/`);
        
        if (details.data?.username) {
          setUSERNAME(details.data.username);
          console.log("Username set to:", details.data.username);
        } else {
          setError("No username found in response");
          console.warn("No username in response:", details);
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Unknown error";
        setError(errorMessage);
        console.error("Failed to fetch user details:", err.response?.data || err);
      
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []); 


  // Filter users based on search and active filter
  const filteredUsers = useMemo(() => {
    const searchTerm = search.toLowerCase();
    let filtered = allUsers.filter((user) => {
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
      const matchesSearch = (
        user.username.toLowerCase().includes(searchTerm) ||
        fullName.includes(searchTerm)
      );
      
      if (activeFilter === 'unread') {
        return matchesSearch && user.lastSender !== USERNAME && !user.isSeen;
      }
      
      return matchesSearch;
    });
    
    // Sort by timestamp (most recent first)
    return filtered.sort((a, b) => 
      new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
    );
  }, [allUsers, search, activeFilter, USERNAME]);

  // Online status simulation (in a real app, this would come from the server)
  const onlineUsers = useMemo(() => {
    // Simulating online status - in a real app this would come from WebSocket
    return allUsers
      .filter(() => Math.random() > 0.7) // 30% of users are "online"
      .map(user => user.username);
  }, [allUsers]);

  // Handle pull to refresh
  const handleTouchStart = useCallback((e) => {
    if (listRef.current && listRef.current.scrollTop === 0) {
      setPullToRefresh({
        active: true,
        startY: e.touches[0].clientY,
        distance: 0
      });
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (pullToRefresh.active) {
      const distance = e.touches[0].clientY - pullToRefresh.startY;
      if (distance > 0) {
        setPullToRefresh(prev => ({ ...prev, distance: Math.min(distance, 80) }));
      }
    }
  }, [pullToRefresh.active, pullToRefresh.startY]);

  const handleTouchEnd = useCallback(() => {
    if (pullToRefresh.active && pullToRefresh.distance > 50) {
      setRefreshing(true);
      // Simulate refresh
      setTimeout(() => {
        setRefreshing(false);
        setPullToRefresh({ active: false, startY: 0, distance: 0 });
      }, 1000);
    } else {
      setPullToRefresh({ active: false, startY: 0, distance: 0 });
    }
  }, [pullToRefresh.active, pullToRefresh.distance]);

  // WebSocket connection
  useEffect(() => {
    let ws;
    let loadTimeout;

    const connectWS = async () => {
      try {
        const res = await api.get("/ws-token/", {
          withCredentials: true,
        });
        const wsToken = res.data.ws_token;

        ws = new WebSocket(
          `wss://pixel-classes.onrender.com/ws/message-inbox/?token=${wsToken}`
        );
        wsRef.current = ws;

        loadTimeout = setTimeout(() => {
          console.warn("No inbox_list received, stopping loader.");
          setLoading(false);
        }, 5000);

        ws.onopen = () => {
          console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === "inbox_data") {
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
                  messageStatus: data.message_status || 'sent'
                },
                ...updated,
              ].sort(
                (a, b) => new Date(b.lastTime || 0) - new Date(a.lastTime || 0)
              );
            });
          }
        };

        ws.onerror = (err) => {
          console.error("WebSocket error", err);
          clearTimeout(loadTimeout);
          setLoading(false);
        };

        ws.onclose = () => {
          console.log("WebSocket closed");
          clearTimeout(loadTimeout);
          setLoading(false);
        };
      } catch (err) {
        console.error("Failed to fetch WebSocket token", err);
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
      <header className="sticky top-0 bg-gray-900/95 backdrop-blur-lg flex items-center gap-3 px-4 py-3 border-b border-white/10 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <Undo2 size={20} />
        </button>
        <h1 className="text-xl font-semibold flex-1">Messages</h1>
        <button 
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>
      </header>

      <main 
        className="flex-1 flex flex-col"
        ref={listRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull to refresh indicator */}
        <div className="overflow-hidden" style={{ height: pullToRefresh.distance }}>
          <div className="flex items-center justify-center h-12">
            {pullToRefresh.distance > 50 ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.99994L16.25 7.82837M4.92157 19.0784L7.75 16.25M4.92157 4.99994L7.75 7.82837" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            ) : (
              <span>Pull to refresh</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <ChatUserSkeleton key={i} />
            ))}
          </div>
        ) : allUsers.length === 0 ? (
          <EmptyState onFindFriendsClick={() => navigate("/search")} />
        ) : (
          <div className="flex flex-col h-full p-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                className="w-full bg-white/5 pl-12 pr-4 py-3 text-white rounded-xl border-2 border-transparent focus:border-blue-500 transition-colors duration-300 outline-none placeholder:text-white/40"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                value={search}
                type="text"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 hide-scrollbar">
              {['All', 'Unread', 'Groups'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter.toLowerCase())}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === filter.toLowerCase() 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Users list */}
            <motion.div layout className="flex flex-col overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user) => (
                  <motion.div
                    layout
                    key={user.username}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => navigate(`/chat/${user.username}`)}
                    className="cursor-pointer p-3 rounded-lg flex items-center gap-4 hover:bg-white/10 active:bg-white/15 transition-colors"
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
                      {/* Online status indicator */}
                      {onlineUsers.includes(user.username) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900" />
                      )}
                      {/* Unread message indicator */}
                      {user.lastSender && user.lastSender !== USERNAME && !user.isSeen && (
                        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-blue-500 border-2 border-gray-900 text-xs font-bold flex items-center justify-center">
                          {user.unreadCount || 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold truncate flex items-center gap-1">
                          {user.username}
                          {verifiedUsernames.has(user?.username) && (
                            <VerifiedBadge size={16} />
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
                      <div className="flex items-center gap-1">
                        <p
                          className={`text-sm truncate flex-1 ${user.lastSender !== USERNAME && !user.isSeen
                              ? "text-white font-semibold"
                              : "text-white/60"
                            }`}
                        >
                          {user.lastSender === USERNAME && user.latest_message
                            ? `You: ${user.latest_message}`
                            : user.latest_message ||
                            `${user.first_name || ""} ${user.last_name || ""}`.trim() || "No messages yet"}
                        </p>
                        <MessageStatus 
                          status={user.messageStatus} 
                          isOwnMessage={user.lastSender === USERNAME} 
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-10 text-white/40">
                  No conversations found {search ? `for "${search}"` : `in ${activeFilter}`}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}