import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom'; // Use Link/NavLink for routing
import Cookies from 'js-cookie';
import axios from 'axios';
import { Home, MessageSquare, Search, User, Menu, X } from 'lucide-react'; // Using a consistent icon library
import { AnimatePresence, motion } from 'framer-motion';

// Custom Hook to abstract data fetching and clean up the Navbar component
const useChatSummary = (USERNAME) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!USERNAME) return;

    const fetchData = async () => {
      // This logic remains inefficient and should ideally be a single backend API call.
      try {
        const [followingRes, followersRes] = await Promise.all([
          axios.post("https://pixel-classes.onrender.com/api/Profile/following/", { username: USERNAME }),
          axios.post("https://pixel-classes.onrender.com/api/Profile/followers/", { username: USERNAME }),
        ]);

        const combinedList = [...followersRes.data, ...followingRes.data];
        const uniqueUsers = Array.from(new Map(combinedList.map(user => [user.username, user])).values());

        const messageChecks = await Promise.all(
          uniqueUsers.map(async (user) => {
            try {
              const roomName = [USERNAME, user.username].sort().join("__");
              const res = await fetch(`https://pixel-classes.onrender.com/api/chatting/${roomName}/`);
              const messages = await res.json();
              if (messages.length > 0) {
                const lastMsg = messages[messages.length - 1];
                return lastMsg.sender !== USERNAME && !lastMsg.is_seen;
              }
              return false;
            } catch {
              return false;
            }
          })
        );
        
        const count = messageChecks.filter(isUnread => isUnread).length;
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to fetch chat summary:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll for new messages every 30 seconds
    return () => clearInterval(interval);

  }, [USERNAME]);

  return unreadCount;
};


export default function Navbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setScrolled] = useState(false);
  const token = Cookies.get('refresh_token');
  const USERNAME = Cookies.get("username");
  const profilePic = Cookies.get("profile_pic");
  const unreadCount = useChatSummary(USERNAME);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClass = isScrolled
    ? 'sticky top-0 shadow-lg border-b border-white/10 shadow-black/20'
    : 'sticky top-4 mx-4  border border-white/10';

  return (
    <>
      {/* --- Top Navbar (Desktop & Mobile) --- */}
      <nav className={`z-40 transition-all rounded-2xl duration-300 ${navClass}`}>
        <div className="flex items-center rounded-2xl justify-between p-4 bg-black/30 backdrop-blur-xl">
          <Link to="/" className='w-12 shrink-0'>
            <img src="https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png?updatedAt=1735069173555" alt="Logo" />
          </Link>

          {token ? (
            <>
              {/* Desktop Links */}
              <div className="hidden lg:flex items-center gap-6 text-neutral-300 font-medium">
                <NavLink to="/chat" className={({isActive}) => `transition hover:text-white ${isActive && 'text-white'}`}>Chat</NavLink>
                <NavLink to="/search" className={({isActive}) => `transition hover:text-white ${isActive && 'text-white'}`}>Search</NavLink>
                <NavLink to="/profile" className={({isActive}) => `transition hover:text-white ${isActive && 'text-white'}`}>Profile</NavLink>
                <Link to="/logout" className="transition hover:text-red-400">Logout</Link>
              </div>

              {/* Mobile Profile & Menu Button */}
              <div className="flex items-center gap-4 lg:hidden">
                <Link to="/profile">
                  <img className="w-10 h-10 rounded-3xl border-2 border-white/20 object-cover" src={profilePic} alt="Profile" />
                </Link>
                <button onClick={() => setMenuOpen(!isMenuOpen)} className="text-white">
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
        
        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden lg:hidden bg-black/20 backdrop-blur-xl"
          >
            <div className="flex flex-col p-4 text-neutral-300">
              <Link to="/logout" className="py-2 transition hover:text-red-400">Logout</Link>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </nav>

      {/* --- Bottom Navbar (Mobile Only) --- */}
      {token && (
        <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
          <div className="flex justify-around items-center  bg-black/30 backdrop-blur-xl shadow-2xl shadow-black/30 py-2">
            {[
              { to: "/", icon: Home, label: "Home" },
              { to: "/chat", icon: MessageSquare, label: "Chat", count: unreadCount },
              { to: "/search", icon: Search, label: "Search" },
              { to: "/profile", icon: User, label: "Profile" },
            ].map(item => (
              <NavLink key={item.to} to={item.to} className={({isActive}) => `relative flex flex-col items-center gap-1 w-16 transition ${isActive ? 'text-white' : 'text-neutral-400 hover:text-white'}`}>
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