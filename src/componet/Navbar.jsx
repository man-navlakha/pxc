import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Home, MessageSquare, Search, User, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import api from "../utils/api"; // axios instance

// 🔑 Hook to manage unread chat count via WS
const useChatSummary = (wsToken) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!wsToken) return;

    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsScheme}://pixel-classes.onrender.com/ws/notifications/?token=${wsToken}`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "total_unseen_count") {
          setUnreadCount(data.total_unseen_count || 0);
        }
      } catch (err) {
        console.error("[WS ERROR]", err);
      }
    };

    socket.onerror = (err) => {
      console.error("[WebSocket ERROR]", err);
    };

    return () => socket.close();
  }, [wsToken]);

  return unreadCount;
};

export default function Navbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wsToken, setWsToken] = useState(null);

  // --- Sticky Navbar on Scroll ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Fetch Profile & WS Token ---
  useEffect(() => {
    const fetchProfileAndToken = async () => {
      try {
        // ✅ Get current user's profile
        const details = await api.post("/Profile/details/", {});

        setProfile(details.data);

        // ✅ Get short-lived WS token
        const res = await api.get("/ws-token/", {
          withCredentials: true, // send HttpOnly cookie
        });

        setWsToken(res.data.ws_token);
      } catch (error) {
        console.error("[PROFILE or WS TOKEN ERROR]", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndToken();
  }, []);

  // --- Use WS for unread chat summary ---
  const unreadCount = useChatSummary(wsToken);

  const navClass = isScrolled
    ? "sticky top-0 shadow-lg border-b border-white/10 shadow-black/20"
    : "sticky top-4 mx-4 border border-white/10";

  return (
    <>
      <nav
        className={`z-40 transition-all rounded-2xl duration-300 ${navClass}`}
      >
        <div className="flex items-center rounded-2xl justify-between p-4 bg-black/30 backdrop-blur-xl">
          <Link to="/" className="w-12 shrink-0">
            <img
              src="https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png?updatedAt=1735069173555"
              alt="Logo"
            />
          </Link>

          {!loading && profile ? (
            <>
              {/* Desktop Links */}
              <div className="hidden lg:flex items-center gap-6 text-neutral-300 font-medium">
                <NavLink
                  to="/chat"
                  className={({ isActive }) =>
                    `transition hover:text-white ${isActive && "text-white"}`
                  }
                >
                  Chat
                  {unreadCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to="/search"
                  className={({ isActive }) =>
                    `transition hover:text-white ${isActive && "text-white"}`
                  }
                >
                  Search
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `transition hover:text-white ${isActive && "text-white"}`
                  }
                >
                  Profile
                </NavLink>
                <Link
                  to="/logout"
                  className="transition hover:text-red-400"
                >
                  Logout
                </Link>
              </div>

              {/* Mobile Profile & Menu */}
              <div className="flex items-center gap-4 lg:hidden">
                <Link to="/profile">
                  <img
                    className="w-10 h-10 rounded-3xl border-2 border-white/20 object-cover"
                    src={profile.profile_pic || "https://placehold.co/40"}
                    alt="Profile"
                  />
                </Link>
                <button
                  onClick={() => setMenuOpen(!isMenuOpen)}
                  className="text-white"
                >
                  {isMenuOpen ? <X /> : <Menu />}
                </button>
              </div>
            </>
          ) : (
            <Link to="/auth/login">
              <button className="px-4 py-2 text-sm font-semibold text-white bg-white/5 border border-white/10 rounded-lg transition hover:bg-white/10">
                Login
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden lg:hidden bg-black/20 backdrop-blur-xl"
            >
              <div className="flex flex-col p-4 text-neutral-300">
                <Link to="/chat" className="py-2 transition hover:text-white">
                  Chat
                </Link>
                <Link to="/search" className="py-2 transition hover:text-white">
                  Search
                </Link>
                <Link to="/profile" className="py-2 transition hover:text-white">
                  Profile
                </Link>
                <Link
                  to="/logout"
                  className="py-2 transition hover:text-red-400"
                >
                  Logout
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- Bottom Navbar (Mobile Only) --- */}
      {profile && (
        <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
          <div className="flex justify-around items-center bg-black/30 backdrop-blur-xl shadow-2xl shadow-black/30 py-2">
            {[
              { to: "/", icon: Home, label: "Home" },
              {
                to: "/chat",
                icon: MessageSquare,
                label: "Chat",
                count: unreadCount,
              },
              { to: "/search", icon: Search, label: "Search" },
              { to: "/profile", icon: User, label: "Profile" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex flex-col items-center gap-1 w-16 transition ${
                    isActive
                      ? "text-white"
                      : "text-neutral-400 hover:text-white"
                  }`
                }
              >
                <item.icon />
                <span className="text-xs">{item.label}</span>
                {item.count > 0 && (
                  <span className="absolute top-[-4px] right-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
