import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';

import Navbar from "../componet/Navbar";
import Footer from "../componet/Footer";

// --- HOOK: Debounces input to prevent API calls on every keystroke ---
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

// --- UI COMPONENTS ---
const UserCardSkeleton = () => (
    <div className="flex items-center gap-4 p-4 w-full animate-pulse">
        <div className="w-12 h-12 rounded-full bg-white/10"></div>
        <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 rounded bg-white/10"></div>
            <div className="h-3 w-1/3 rounded bg-white/10"></div>
        </div>
        <div className="h-10 w-24 rounded-xl bg-white/10"></div>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="text-center py-16 text-white/60">
        <p>{message}</p>
    </div>
);


export default function UserSearch() {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const usernamec = Cookies.get("username");
    const navigate = useNavigate();

    // --- HOOKS: Use debounced search term for API calls ---
    const debouncedSearchTerm = useDebounce(search, 500);

    const follow = async (follow_username) => {
        try {
            const response = await axios.post("https://pixel-classes.onrender.com/api/Profile/follow/", {
                username: usernamec,
                follow_username: follow_username,
            });
            if (response.data.message) {
                toast.success(`You are now following ${follow_username}`);
                setUsers(prev => prev.map(u => u.username === follow_username ? { ...u, is_following: true } : u));
            }
        } catch (error) {
            toast.error("Error following user.");
        }
    };

    const unfollow = async (unfollow_username) => {
        try {
            const response = await axios.post("https://pixel-classes.onrender.com/api/Profile/unfollow/", {
                username: usernamec,
                unfollow_username: unfollow_username,
            });
            if (response.data.message) {
                toast.info(`Unfollowed ${unfollow_username}`);
                setUsers(prev => prev.map(u => u.username === unfollow_username ? { ...u, is_following: false } : u));
            }
        } catch (error) {
            toast.error("Error unfollowing user.");
        }
    };

    // --- EFFECT: Fetches users based on the debounced search term ---
    useEffect(() => {
        const fetchUsers = async () => {
            if (!debouncedSearchTerm.trim()) {
                setUsers([]);
                return;
            }
            setLoading(true);
            try {
                // IMPORTANT: Assumes the backend now returns `is_following` for each user.
                const response = await axios.get("https://pixel-classes.onrender.com/api/Profile/UserSearch/", {
                    params: { username: debouncedSearchTerm, current_user: usernamec } // Pass current user for backend logic
                });
                
                // Filter out the current user from the results
                const filtered = response.data.filter(user => user.username !== usernamec);
                setUsers(filtered);

            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("Could not fetch users.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [debouncedSearchTerm, usernamec]);

    return (
        <>
            <div className="bg-pattern"></div>
            <div className="mesh_profile ccf text-white min-h-screen">
                <Navbar />
                <div className="flex flex-col items-center mt-10 justify-center px-4">
                    <div className="w-full max-w-2xl mt-10">
                        <h1 className="text-4xl font-bold text-center mb-6">Find Users</h1>
                        <div className="relative mb-8">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
                            <input
                                className="w-full bg-white/5 px-12 py-4 text-white rounded-xl border-2 border-transparent focus:border-blue-500 transition-colors duration-300 outline-none"
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by username or name..."
                                value={search}
                                type="text"
                            />
                        </div>

                        <div className="flex flex-col w-full space-y-2">
                            <AnimatePresence>
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <UserCardSkeleton />
                                        </motion.div>
                                    ))
                                ) : users.length > 0 ? (
                                    users.map((user) => (
                                        <motion.div key={user.username} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-transparent hover:border-white/20 hover:bg-white/10 transition-all">
                                                <div onClick={() => navigate(`/profile/${user.username}`)} className="flex items-center gap-4 cursor-pointer">
                                                    <img
                                                        src={user.profile_pic || `https://i.pravatar.cc/150?u=${user.username}`}
                                                        alt={user.username}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                                                    />
                                                    <div>
                                                        <div className="text-lg font-semibold">{user.username}</div>
                                                        <div className="text-sm text-white/60">{user.first_name} {user.last_name}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {user.is_following ? (
                                                        <>
                                                            <button onClick={() => navigate(`/chat/${user.username}`)} className="px-3 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Message</button>
                                                            <button onClick={() => unfollow(user.username)} className="px-3 py-2 text-sm rounded-lg bg-red-500/80 hover:bg-red-500 transition-colors">Unfollow</button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => follow(user.username)} className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-base">person_add</span> Follow
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : debouncedSearchTerm ? (
                                    <EmptyState message="No users found for your search." />
                                ) : (
                                    <EmptyState message="Start typing to search for users." />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
                <Footer />
        </>
    );
}