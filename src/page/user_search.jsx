import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "../componet/Navbar";
import Footer from "../componet/Footer";

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
    const [actionLoading, setActionLoading] = useState(null); // --- NEW: State for button loading
    const usernamec = Cookies.get("username");
    const navigate = useNavigate();

    const follow = async (follow_username) => {
        setActionLoading(follow_username); // --- NEW: Start animation
        try {
            const response = await axios.post("https://pixel-classes.onrender.com/api/Profile/follow/", {
                username: usernamec,
                follow_username: follow_username,
            });
            if (response.data.message) {
                alert(`You are now following ${follow_username}`);
                setUsers(prevUsers => prevUsers.map(user => user.username === follow_username ? { ...user, is_following: true } : user));
            }
        } catch (error) {
            console.error("Error following user:", error);
            alert("Error following user.");
        } finally {
            setActionLoading(null); // --- NEW: Stop animation
        }
    };

    const unfollow = async (unfollow_username) => {
        setActionLoading(unfollow_username); // --- NEW: Start animation
        try {
            const response = await axios.post("https://pixel-classes.onrender.com/api/Profile/unfollow/", {
                username: usernamec,
                unfollow_username: unfollow_username,
            });
            if (response.data.message) {
                alert(`Unfollowed ${unfollow_username}`);
                setUsers(prevUsers => prevUsers.map(user => user.username === unfollow_username ? { ...user, is_following: false } : user));
            }
        } catch (error) {
            console.error("Error unfollow user:", error);
            alert("Error unfollowing user.");
        } finally {
            setActionLoading(null); // --- NEW: Stop animation
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const followingRes = await axios.post("https://pixel-classes.onrender.com/api/Profile/following/", { username: usernamec });
                const followingUsernames = followingRes.data.map((u) => u.username);
                const response = await axios.get("https://pixel-classes.onrender.com/api/Profile/UserSearch/", {
                    params: { username: search }
                });
                const filtered = response.data
                    .filter((user) => user.username !== usernamec)
                    .map((user) => ({
                        ...user,
                        is_following: followingUsernames.includes(user.username),
                    }));
                setUsers(filtered);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        if (search.trim()) {
            fetchUsers();
        } else {
            setUsers([]);
        }
    }, [search, usernamec]);

    const filteredUsers = users.filter((user) => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
        const username = user.username.toLowerCase();
        const searchTerm = search.toLowerCase();
        return username.includes(searchTerm) || fullName.includes(searchTerm);
    });

    return (
        <>
            <div className="bg-pattern"></div>
            <div className="mesh_profile ccf text-white min-h-screen">
                <Navbar />
                <div className="flex flex-col mt-10 items-center min-h-screen py-6  px-4">
                    <div className="w-full max-w-2xl ">
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

                        <div className="flex flex-col w-full gap-2 space-y-2">
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div key="loader">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                <UserCardSkeleton />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : filteredUsers.length > 0 ? (
                                    <motion.div key="results">
                                        {filteredUsers.map((user) => (
                                            <motion.div key={user.username} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                                <div className="flex items-center justify-between p-3 m-2 rounded-2xl bg-white/5 border  border-transparent hover:border-white/20 hover:bg-white/10 transition-all">
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
                                                                {/* --- UPDATED: Unfollow Button with animation --- */}
                                                                <button
                                                                    onClick={() => unfollow(user.username)}
                                                                    className="px-3 py-2 text-sm rounded-lg bg-red-500/80 hover:bg-red-500 transition-colors w-[90px] text-center"
                                                                    disabled={actionLoading === user.username}
                                                                >
                                                                    {actionLoading === user.username ? <div className="h-5 w-5 border-2 border-white/50 border-t-white rounded-full animate-spin mx-auto"></div> : 'Unfollow'}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            // --- UPDATED: Follow Button with animation ---
                                                            <button
                                                                onClick={() => follow(user.username)}
                                                                className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 w-[100px]"
                                                                disabled={actionLoading === user.username}
                                                            >
                                                                {actionLoading === user.username
                                                                    ? <div className="h-5 w-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                                                    : <><span className="material-symbols-outlined text-base">person_add</span> Follow</>
                                                                }
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : search.trim() ? (
                                    <motion.div key="no-results">
                                        <EmptyState message="No users found for your search." />
                                    </motion.div>
                                ) : (
                                    <motion.div key="initial">
                                        <EmptyState message="Start typing to search for users." />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}