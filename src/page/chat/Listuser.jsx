import { useEffect, useState, useMemo, useRef, useCallback, useDeferredValue } from "react";
import { Check, MessageCircle, RefreshCw, Search, Undo2, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import api from "../../utils/api";
import { buildWebSocketUrl } from "../../utils/ws";
import { verifiedUsernames } from "../../verifiedAccounts";
import VerifiedBadge from "../../componet/VerifiedBadge";

// Shadcn/ui components
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Skeleton } from "../../components/ui/skeleton";


// Helpers
const cx = (...classes) => classes.filter(Boolean).join(" ");

function formatInboxTime(input) {
  const iso = toISOStringCompat(input);
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getUserInitials(user) {
  const first = user.first_name?.[0] || "";
  const last = user.last_name?.[0] || "";
  const fallback = (user.display_name || user.username || "U").trim()[0] || "U";
  return `${first}${last}`.trim().toUpperCase() || fallback.toUpperCase();
}

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

function processInboxUser(u, currentUsername) {
  const latest = u.latest_message && typeof u.latest_message === "object"
    ? u.latest_message
    : null;
  const serverUnread = u.unread_count ?? null;
  const isOwnMessage = !!(
    latest &&
    latest.sender_username &&
    String(latest.sender_username) === String(currentUsername)
  );
  const seenByOther = isOwnMessage ? !!latest?.is_seen : null;

  let hasUnread = false;
  let unreadCount = 0;
  if (serverUnread != null) {
    hasUnread = Number(serverUnread) > 0;
    unreadCount = Number(serverUnread);
  } else if (latest) {
    if (isOwnMessage) {
      hasUnread = false;
      unreadCount = 0;
    } else {
      hasUnread = !latest?.is_seen;
      unreadCount = hasUnread ? 1 : 0;
    }
  }

  return {
    id: u.id,
    username: u.username,
    display_name: u.display_name,
    profile_pic: u.profile_pic,
    first_name: u.first_name ?? "",
    last_name: u.last_name ?? "",
    latest_message: latest || u.latest_message,
    timestamp: u.timestamp ?? latest?.timestamp ?? null,
    isOwnMessage,
    seenByOther,
    hasUnread,
    unreadCount,
    is_online: u.is_online ?? false,
    is_support_thread: Boolean(u.is_support_thread),
    support_username: u.support_username || "",
    conversation_key: u.conversation_key || u.username,
    is_pinned: Boolean(u.is_pinned),
  };
}

function sortInboxUsers(users) {
  return users.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    if (a.hasUnread && !b.hasUnread) return -1;
    if (!a.hasUnread && b.hasUnread) return 1;

    const ta = a.timestamp ? new Date(toISOStringCompat(a.timestamp)).getTime() : 0;
    const tb = b.timestamp ? new Date(toISOStringCompat(b.timestamp)).getTime() : 0;
    return tb - ta;
  });
}

// Small presentational components
const MessageStatus = ({ isOwnMessage, seenByOther }) => {
  if (!isOwnMessage) return null;
  return (
    <span className="ml-2 flex items-center">
      {seenByOther ? (
        <span title="Seen" className="flex items-center gap-0.5">
          <Check size={12} className="text-blue-300" />
          <Check size={12} className="text-blue-300" />
        </span>
      ) : (
        <Check size={14} className="text-zinc-500" title="Sent" />
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
    >
      <Badge variant="default" className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3b82f6] px-1.5 text-[10px] font-bold text-white shadow-none">
        {count > 99 ? "99+" : count}
      </Badge>
    </motion.span>
  );
};


const ChatUserSkeleton = () => (
  <div className="rounded-[18px] px-4 py-3">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full bg-white/[0.12]" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2 rounded-full bg-white/[0.12]" />
        <Skeleton className="h-3 w-3/4 rounded-full bg-white/10" />
      </div>
    </div>
  </div>
);


const EmptyState = ({ onFindFriendsClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center"
  >
    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/[0.12] bg-white/[0.08] text-zinc-100">
      <MessageCircle size={28} />
    </div>

    <h3 className="text-xl font-semibold text-white">No conversations yet</h3>
    <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-400">
      Start a conversation by connecting with other users or finding friends.
    </p>
    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
      <Button onClick={onFindFriendsClick} className="h-11 gap-2 rounded-2xl bg-[#3b82f6] px-5 font-semibold text-white hover:bg-[#2f78ed]">
        <Users size={16} />
        Find Friends
      </Button>
      <Button variant="outline" onClick={() => window.location.reload()} className="h-11 rounded-2xl border-white/[0.12] bg-white/[0.06] px-5 text-zinc-200 hover:bg-white/10 hover:text-white">
        <RefreshCw size={16} className="mr-2" />
        Refresh
      </Button>
    </div>
  </motion.div>
);

export default function Listuser({ embedded = false }) {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [filterMode, setFilterMode] = useState("inbox");
  const deferredSearch = useDeferredValue(search);

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
    const searchTerm = deferredSearch.toLowerCase().trim();
    let filtered = allUsers.filter((user) => {
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
      const username = (user.username || "").toLowerCase();
      const displayName = (user.display_name || "").toLowerCase();
      const supportUsername = (user.support_username || "").toLowerCase();
      if (filterMode === "unread" && !user.hasUnread) return false;
      const matchesSearch =
        !searchTerm ||
        username.includes(searchTerm) ||
        fullName.includes(searchTerm) ||
        displayName.includes(searchTerm) ||
        supportUsername.includes(searchTerm);
      return matchesSearch;
    });

    sortInboxUsers(filtered);

    return filtered;
  }, [allUsers, deferredSearch, filterMode]);

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
    const processUser = (u) => processInboxUser(u, currentUsername);
    const applyInbox = (inbox, totalUnreadCountValue = null) => {
      const processed = sortInboxUsers((inbox || []).map(processUser));
      if (!mounted) return;
      setAllUsers(processed);
      if (totalUnreadCountValue != null) {
        setTotalUnreadCount(totalUnreadCountValue);
      }
      setLoading(false);
    };
    const loadInboxSnapshot = async () => {
      const inboxRes = await api.get("/chatting/inbox/", { withCredentials: true });
      applyInbox(inboxRes.data?.inbox || [], inboxRes.data?.total_unread_count ?? 0);
    };

    const connectWS = async () => {
      try {
        await loadInboxSnapshot();

        const res = await api.get("/ws-token/", { withCredentials: true });
        const wsToken = res.data?.ws_token;
        if (!wsToken) throw new Error("No ws token");

        const wsUrl = buildWebSocketUrl("/ws/message-inbox");
        wsUrl.searchParams.set("token", wsToken);

        ws = new WebSocket(wsUrl.toString());
        wsRef.current = ws;


        ws.onopen = () => {
          console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // Full inbox payload
            if (data.type === "inbox_data" && Array.isArray(data.inbox)) {
              clearTimeout(loadTimeout);
              applyInbox(data.inbox, data.total_unread_count ?? null);
            }

            // Single update
            if (data.type === "inbox_update" && data.user) {
              setAllUsers(prev => {
                const updated = processUser({ ...(data.user || {}), latest_message: data.latest_message, unread_count: data.unread_count, is_seen: data.is_seen, timestamp: data.timestamp });
                const updatedKey = updated.conversation_key || updated.username;
                const copy = prev.filter(p => (p.conversation_key || p.username) !== updatedKey);
                copy.unshift(updated);
                return sortInboxUsers(copy);
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
        try {
          await loadInboxSnapshot();
        } catch (snapshotError) {
          console.error("Failed to load inbox snapshot", snapshotError);
          if (mounted) setLoading(false);
        }
      }
    };

    connectWS();

    return () => {
      mounted = false;
      clearTimeout(loadTimeout);
      if (ws) ws.close();
    };
  }, [currentUsername, currentUserId]);

  const getChatUrl = useCallback((user) => {
    if (user.is_support_thread) {
      const query = user.support_username
        ? `?supportUser=${encodeURIComponent(user.support_username)}`
        : "";
      return `/chat/pixel${query}`;
    }

    return `/chat/${user.username}`;
  }, []);

  const handleChatNavigation = useCallback((user) => {
    navigate(getChatUrl(user));
  }, [getChatUrl, navigate]);

  const rootClass = embedded
    ? "chat-font flex h-full w-full flex-col bg-[#4b4644] text-white"
    : "chat-font flex min-h-[100dvh] flex-col bg-[#111111] text-white";

  return (
    <div className={rootClass}>
      <header className="shrink-0 border-b border-white/10 bg-white/[0.035] backdrop-blur-xl">
        {embedded ? (
          <div className="flex h-[64px] items-center justify-between px-5">
          
            <div className="flex items-center gap-2 text-zinc-300">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/search")}
                aria-label="Find people"
                className="h-9 w-9 rounded-xl text-zinc-300 hover:bg-white/10 hover:text-white"
              >
                <Users size={18} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              aria-label="Go back"
              className="h-10 w-10 rounded-2xl text-zinc-200 hover:bg-white/[0.08] hover:text-white"
            >
              <Undo2 size={19} />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold text-white">Messages</h1>
              <p className="truncate text-sm text-zinc-400">
                {totalUnreadCount || unreadConversationsCount
                  ? `${totalUnreadCount || unreadConversationsCount} unread`
                  : "Inbox and direct messages"}
              </p>
            </div>
          </div>
        )}

        <div className="px-4 pb-4 sm:px-5">
          <div className="mb-3 flex items-center gap-2">
            {[
              ["inbox", "Inbox"],
              ["unread", "Unread"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilterMode(value)}
                className={cx(
                  "rounded-xl px-3 py-2 text-sm font-semibold transition",
                  filterMode === value
                    ? "bg-white text-[#2f2a28]"
                    : "text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
            <Input
              className="h-11 rounded-2xl border-white/10 bg-black/[0.18] pl-10 pr-4 text-sm text-white placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-white/20"
              placeholder="Search conversations"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main
        ref={listRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="chat-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3"
      >
        <div className="overflow-hidden" style={{ height: pullToRefresh.distance }}>
          <div className="flex h-12 items-center justify-center text-sm text-zinc-300">
            {pullToRefresh.distance > 50 || refreshing ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <RefreshCw size={18} />
              </motion.div>
            ) : (
              <span>Pull to refresh</span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => <ChatUserSkeleton key={i} />)}
          </div>
        ) : allUsers.length === 0 ? (
          <EmptyState onFindFriendsClick={() => navigate("/search")} />
        ) : (
          <motion.div layout className="space-y-1.5 pb-4">
            <AnimatePresence mode="popLayout">
              {filteredUsers.map((user) => {
                const chatUrl = getChatUrl(user);
                const isActive = location.pathname + location.search === chatUrl;
                const timeString = formatInboxTime(
                  user.timestamp ?? user.latest_message?.timestamp ?? user.latest_message?.created_at ?? null
                );
                const latestText =
                  (user.isOwnMessage && user.latest_message ? "You: " : "") +
                  (getLatestMessageText(user.latest_message) ||
                    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                    user.username ||
                    "New conversation");

                return (
                  <motion.button
                    key={user.conversation_key || user.username}
                    type="button"
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => handleChatNavigation(user)}
                    className={cx(
                      "group w-full rounded-[18px] px-4 py-3 text-left transition",
                      isActive
                        ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-950/25"
                        : "text-zinc-100 hover:bg-white/[0.08]",
                      user.hasUnread && !isActive && "bg-white/[0.055]"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative shrink-0">
                        <Avatar className="h-12 w-12 border border-white/[0.16]">
                          <AvatarImage src={user.profile_pic || `https://i.pravatar.cc/150?u=${user.username}`} />
                          <AvatarFallback className="bg-black/[0.24] text-sm font-semibold text-white">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        {user.is_online && (
                          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#4b4644] bg-[#34d399]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex min-w-0 items-center gap-2">
                          <span
                            className={cx(
                              "min-w-0 flex-1 truncate text-[15px] font-semibold",
                              isActive ? "text-white" : user.hasUnread ? "text-white" : "text-zinc-100"
                            )}
                          >
                            {user.display_name || user.username}
                          </span>
                          {!user.is_support_thread && verifiedUsernames.has(user?.username) && <VerifiedBadge size={15} />}
                          {timeString && (
                            <span className={cx("shrink-0 text-xs", isActive ? "text-blue-100" : "text-zinc-300")}>
                              {timeString}
                            </span>
                          )}
                        </div>

                        <div className="flex min-w-0 items-center gap-2">
                          <p className={cx("min-w-0 flex-1 truncate text-sm", isActive ? "text-blue-50" : user.hasUnread ? "text-zinc-100" : "text-zinc-300")}>
                            {latestText}
                          </p>
                          <MessageStatus isOwnMessage={user.isOwnMessage} seenByOther={user.seenByOther} />
                          <UnreadBadge count={user.unreadCount || 0} isVisible={user.hasUnread && !isActive} />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>

            {filteredUsers.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-zinc-300">
                {filterMode === "unread" ? "No unread conversations" : `No conversations found${search ? ` for "${search}"` : ""}`}
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
