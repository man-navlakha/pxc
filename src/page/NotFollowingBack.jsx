import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, UserMinus } from "lucide-react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { verifiedUsernames } from "../verifiedAccounts";
import VerifiedBadge from "../componet/VerifiedBadge";

const SuggestToFollow = () => {
  const [notFollowingBack, setNotFollowingBack] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [usernamec, setUsernamec] = useState(null);

  const navigate = useNavigate();

  // animations
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const me = await api.get("/me/");
        const username = me.data?.username;
        setUsernamec(username);

        if (!username) return;

        // fetch followers + following
        const [followersRes, followingRes] = await Promise.all([
          api.post("/Profile/followers/", { username }),
          api.post("/Profile/following/", { username }),
        ]);

        const followers = followersRes.data || [];
        const following = followingRes.data || [];

        const notBack = followers.filter(
          (f) => !following.some((g) => g.username === f.username)
        );

        setNotFollowingBack(notBack);

        if (notBack.length > 0) {
          setSuggestions(notBack);
        } else {
          // skip usernames already in notFollowingBack (case-sensitive)
          const skipSet = new Set(notBack.map((u) => u.username));

          const verifiedDetails = await Promise.all(
            Array.from(verifiedUsernames).map(async (targetUser) => {
              if (skipSet.has(targetUser)) return null; // skip duplicates

              try {
                const details = await api.post("/Profile/details/", {
                  username: targetUser,
                });
                return {
                  ...details.data,
                  is_following: following.some(
                    (f) => f.username === details.data.username
                  ),
                };
              } catch (err) {
                console.error("Error fetching details for", targetUser, err);
                return null;
              }
            })
          );

          setSuggestions(verifiedDetails.filter(Boolean));
        }
      } catch (err) {
        console.error("Error fetching followers/following:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // follow
  const follow = async (follow_username) => {
    setActionLoading(follow_username);
    try {
      const res = await api.post("/Profile/follow/", {
        username: usernamec,
        follow_username,
      });
      if (res.data.message) {
        setSuggestions((prev) =>
          prev.map((u) =>
            u.username === follow_username ? { ...u, is_following: true } : u
          )
        );
      }
    } catch (err) {
      console.error("Error following user:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // unfollow
  const unfollow = async (unfollow_username) => {
    setActionLoading(unfollow_username);
    try {
      const res = await api.post("/Profile/unfollow/", {
        username: usernamec,
        unfollow_username,
      });
      if (res.data.message) {
        setSuggestions((prev) =>
          prev.map((u) =>
            u.username === unfollow_username ? { ...u, is_following: false } : u
          )
        );
      }
    } catch (err) {
      console.error("Error unfollowing user:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <aside className="lg:col-span-1">
      <h2 className="text-2xl font-bold text-white/90 mb-4 px-3 flex items-center gap-2">
        <Users size={24} /> Suggest to Follow
      </h2>

      <div className="glass-info p-4 m-3 rounded-2xl border border-white/10 bg-white/10">
        {loading ? (
          <p className="text-center text-white/60 py-8">Loading...</p>
        ) : suggestions.length > 0 ? (
          <motion.ul
            className="space-y-3"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {suggestions.map((user) => (
                <motion.li
                  key={user.username}
                  layout
                  variants={itemVariants}
                  exit="exit"
                  className="flex items-center justify-between p-3 rounded-lg bg-black/20"
                >
                  <div
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/profile/${user.username}`)}
                  >
                    <img
                      src={
                        user.profile_pic ||
                        `https://i.pravatar.cc/150?u=${user.username}`
                      }
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white/90 truncate flex items-center gap-1">
                        {user.username}
                        {verifiedUsernames.has(user.username) && (
                          <VerifiedBadge size={14} />
                        )}
                      </p>
                      <p className="text-xs text-white/50 truncate">
                        {user.first_name} {user.last_name}
                      </p>
                    </div>
                  </div>
                  {user.is_following ? (
                    <button
                      onClick={() => unfollow(user.username)}
                      disabled={actionLoading === user.username}
                      className="p-2 rounded-full bg-white/5 text-red-400 hover:bg-red-500/50 hover:text-white transition-colors"
                      title="Unfollow"
                    >
                      {actionLoading === user.username ? (
                        <div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      ) : (
                        <UserMinus size={18} />
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => follow(user.username)}
                      disabled={actionLoading === user.username}
                      className="p-2 rounded-full bg-white/5 text-white/70 hover:bg-blue-500/50 hover:text-white transition-colors"
                      title="Follow"
                    >
                      {actionLoading === user.username ? (
                        <div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      ) : (
                        <UserPlus size={18} />
                      )}
                    </button>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <div className="text-center text-white/60 text-sm py-8">
            <span className="material-symbols-outlined text-4xl text-white/20">
              group_add
            </span>
            <p className="mt-2 font-semibold">No Suggestions Available</p>
            <p className="text-xs text-white/40">
              Looks like you’re already connected with everyone 🎉
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SuggestToFollow;
