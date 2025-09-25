// FollowersPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Undo2 } from "lucide-react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { verifiedUsernames } from "../verifiedAccounts";
import VerifiedBadge from "../componet/VerifiedBadge";
import api from "../utils/api";

const UserCardSkeleton = () => (
    <div className="flex items-center gap-4 p-4 animate-pulse">
        <div className="w-14 h-14 rounded-full bg-white/10"></div>
        <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-white/10"></div>
        </div>
        <div className="h-10 w-24 rounded-lg bg-white/10"></div>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="text-center py-16 text-white/60">
        <span className="material-symbols-outlined text-6xl text-white/20">group_off</span>
        <p className="mt-4">{message}</p>
    </div>
);

const FollowersPage = ({ username, onClose }) => {
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUserUsername = Cookies.get("username");

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!username) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // ✅ Pass the username parameter to fetch specific user's followers
                const followersRes = await api.post("/Profile/followers/", {
                    username: username
                });
                
                // ✅ Get current user's following list to determine follow status
                const followingRes = await api.post("/Profile/following/", {
                    username: currentUserUsername
                });

                const followingUsernames = new Set(followingRes.data?.map(u => u.username) || []);
                const usersWithStatus = (followersRes.data || []).map(user => ({
                    ...user,
                    is_following: followingUsernames.has(user.username)
                }));

                setFollowers(usersWithStatus);
            } catch (err) {
                console.error("Error fetching followers:", err);
                toast.error("Could not load followers.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [username, currentUserUsername]);

    const handleFollow = async (targetUsername) => {
        try {
            await api.post("/Profile/follow/", {
                username: currentUserUsername,
                follow_username: targetUsername,
            });
            toast.success(`You are now following ${targetUsername}`);
            setFollowers(followers.map(u => u.username === targetUsername ? { ...u, is_following: true } : u));
        } catch (err) {
            console.error("Error following user:", err);
            toast.error(`Could not follow ${targetUsername}.`);
        }
    };

    const handleUnfollow = async (targetUsername) => {
        try {
            await api.post("/Profile/unfollow/", {
                username: currentUserUsername,
                unfollow_username: targetUsername,
            });
            toast.info(`Unfollowed ${targetUsername}`);
            setFollowers(followers.map(u => u.username === targetUsername ? { ...u, is_following: false } : u));
        } catch (err) {
            console.error("Error unfollowing user:", err);
            toast.error(`Could not unfollow ${targetUsername}.`);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto py-4 px-2 sm:px-6">
            {/* <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <Undo2 className="text-white" />
                </button>
                <h1 className="text-3xl font-bold text-white/90 text-center flex-1">
                    {username === currentUserUsername ? "Your Followers" : `${username}'s Followers`}
                </h1>
            </div> */}

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => <UserCardSkeleton key={i} />)}
                </div>
            ) : followers.length === 0 ? (
                <EmptyState message={`${username} doesn't have any followers yet.`} />
            ) : (
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
                    {followers.map((user) => (
                        <motion.div key={user.username} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                            <Link to={`/profile/${user.username}`} className="flex items-center gap-3 min-w-0">
                                <img src={user.profile_pic} alt={user.username} className="w-12 h-12 rounded-full border-2 border-white/20 object-cover" />
                                <p className="font-semibold truncate">{user.username}</p>{verifiedUsernames.has(user?.username) && <VerifiedBadge />}
                            </Link>
                            {user.username !== currentUserUsername && (
                                user.is_following ? (
                                    <button onClick={() => handleUnfollow(user.username)} className="px-3 py-2 text-sm rounded-lg bg-red-500/80 hover:bg-red-500 transition-colors">Unfollow</button>
                                ) : (
                                    <button onClick={() => handleFollow(user.username)} className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2">Follow</button>
                                )
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
};

export default FollowersPage;