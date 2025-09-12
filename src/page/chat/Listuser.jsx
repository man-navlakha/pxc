// Enhanced Listuser.jsx with improved seen/unseen logic
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

// Enhanced Message Status Component
const MessageStatus = ({ status, isOwnMessage, isSeen }) => {
  if (!isOwnMessage) return null;
  
  if (isSeen) {
    return <CheckCheck size={14} className="text-blue-400" title="Seen" />;
  } else {
    return <Check size={14} className="text-white/40" title="Sent" />;
  }
};

// Enhanced Unread Badge Component
const UnreadBadge = ({ count, isVisible }) => {
  if (!isVisible || count === 0) return null;
  
  return (
    <motion.span 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-blue-500 border-2 border-gray-900 text-xs font-bold flex items-center justify-center"
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  );
};

// Skeleton Loader
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

// Empty State
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

export default function Listuser() {
  const navigate = useNavigate();
  const [USERNAME, setUSERNAME] = useState("");
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const listRef = useRef(null);

  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [pullToRefresh, setPullToRefresh] = useState({ active: false, startY: 0, distance: 0 });
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Enhanced user details fetching
  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const details = await api.post("/Profile/details/", {});
        
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

  // Enhanced filtering with better unread logic
  const filteredUsers = useMemo(() => {
    const searchTerm = search.toLowerCase();
    let filtered = allUsers.filter((user) => {
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
      const matchesSearch = (
        user.username.toLowerCase().includes(searchTerm) ||
        fullName.includes(searchTerm)
      );
      
      if (activeFilter === 'unread') {
        // Show conversations with unread messages
        return matchesSearch && user.hasUnread;
      }
      
      return matchesSearch;
    });
    
    // Enhanced sorting: unread first, then by timestamp
    return filtered.sort((a, b) => {
      // First, prioritize unread messages
      if (a.hasUnread && !b.hasUnread) return -1;
      if (!a.hasUnread && b.hasUnread) return 1;
      
      // Then sort by timestamp
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });
  }, [allUsers, search, activeFilter]);

  // Calculate total unread conversations
  const unreadConversationsCount = useMemo(() => {
    return allUsers.filter(user => user.hasUnread).length;
  }, [allUsers]);

  // Online status simulation
  const onlineUsers = useMemo(() => {
    return allUsers
      .filter(() => Math.random() > 0.7)
      .map(user => user.username);
  }, [allUsers]);

  // Pull to refresh handlers
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
      setTimeout(() => {
        setRefreshing(false);
        setPullToRefresh({ active: false, startY: 0, distance: 0 });
        // Trigger a refresh of inbox data
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "refresh_inbox" }));
        }
      }, 1000);
    } else {
      setPullToRefresh({ active: false, startY: 0, distance: 0 });
    }
  }, [pullToRefresh.active, pullToRefresh.distance]);

  // Enhanced WebSocket connection with better message handling
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
          console.log("WebSocket message received:", data);

          if (data.type === "inbox_data") {
            clearTimeout(loadTimeout);
            
            // Enhanced inbox processing with proper seen/unseen logic
            const processedInbox = data.inbox.map(user => {
              // Determine if message is from current user
              const isOwnMessage = user.latest_message && 
                user.latest_message.sender_id === user.user_id; // This needs adjustment based on your actual data structure
              
              // Determine if conversation has unread messages
              const hasUnread = user.latest_message && 
                !isOwnMessage && 
                !user.is_seen;
              
              return {
                ...user,
                hasUnread,
                unreadCount: hasUnread ? 1 : 0,
                isOwnMessage
              };
            });

            const sorted = processedInbox.sort(
              (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
            );
            
            setAllUsers(sorted);
            setLoading(false);
          }

          if (data.type === "inbox_update") {
            setAllUsers((prev) => {
              const updated = prev.filter((u) => u.username !== data.user.username);
              
              // Determine if message is from current user
              const isOwnMessage = data.latest_message && 
                data.latest_message.sender_id === data.user.user_id; // Adjust based on your data structure
              
              // Determine if conversation has unread messages
              const hasUnread = data.latest_message && 
                !isOwnMessage && 
                !data.is_seen;
              
              const updatedUser = {
                ...data.user,
                latest_message: data.latest_message,
                timestamp: data.timestamp,
                is_seen: data.is_seen,
                hasUnread,
                unreadCount: hasUnread ? 1 : 0,
                isOwnMessage
              };
              
              const newList = [updatedUser, ...updated].sort(
                (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
              );
              
              return newList;
            });
          }

          // Handle total unread count updates
          if (data.type === "total_unread_update") {
            setTotalUnreadCount(data.total_unread_count || 0);
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

    if (USERNAME) {
      connectWS();
    }

    return () => {
      clearTimeout(loadTimeout);
      if (ws) ws.close();
    };
  }, [USERNAME]);

  // Mark conversation as read when navigating to chat
  const handleChatNavigation = useCallback((username) => {
    // Update local state immediately for better UX
    setAllUsers(prev => prev.map(user => {
      if (user.username === username) {
        return {
          ...user,
          is_seen: true,
          hasUnread: false,
          unreadCount: 0
        };
      }
      return user;
    }));
    
    // Navigate to chat
    navigate(`/chat/${username}`);
  }, [navigate]);

  return (
    <div className="min-h-screen ccf flex flex-col text-white bg-gray-900">
      {/* Enhanced Header with unread count */}
      <header className="sticky top-0 bg-gray-900/95 backdrop-blur-lg flex items-center gap-3 px-4 py-3 border-b border-white/10 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <Undo2 size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Messages</h1>
          {unreadConversationsCount > 0 && (
            <p className="text-xs text-blue-400">
              {unreadConversationsCount} unread conversation{unreadConversationsCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="relative">
          <button 
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-xs font-bold flex items-center justify-center">
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </span>
            )}
          </button>
        </div>
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

            {/* Enhanced Filter Tabs with counts */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 hide-scrollbar">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeFilter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                All
                <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">
                  {allUsers.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveFilter('unread')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeFilter === 'unread' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Unread
                {unreadConversationsCount > 0 && (
                  <span className="text-xs bg-red-500 rounded-full px-2 py-0.5">
                    {unreadConversationsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveFilter('groups')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === 'groups' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Groups
              </button>
            </div>

            {/* Enhanced Users list */}
            <motion.div layout className="flex flex-col overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user) => {
                  return (
                    <motion.div
                      layout
                      key={user.username}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleChatNavigation(user.username)}
                      className={`cursor-pointer p-3 rounded-lg flex items-center gap-4 hover:bg-white/10 active:bg-white/15 transition-colors ${
                        user.hasUnread ? 'bg-white/5' : ''
                      }`}
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
                        
                        {/* Enhanced Unread message indicator */}
                        <UnreadBadge 
                          count={user.unreadCount || 0}
                          isVisible={user.hasUnread}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-semibold truncate flex items-center gap-1 ${
                            user.hasUnread ? 'text-white' : 'text-white/80'
                          }`}>
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
                          <p className={`text-sm truncate flex-1 ${
                            user.hasUnread ? "text-white font-medium" : "text-white/60"
                          }`}>
                            {user.isOwnMessage && user.latest_message
                              ? `You: ${user.latest_message}`
                              : user.latest_message ||
                              `${user.first_name || ""} ${user.last_name || ""}`.trim() || ""}
                          </p>
                          
                          <MessageStatus 
                            status={user.messageStatus}
                            isOwnMessage={user.isOwnMessage}
                            isSeen={user.is_seen}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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