import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";

const FollowersPage = ({ username }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await axios.post("https://pixel-classes.onrender.com/api/Profile/followers/", {
          username: username,
        });
        setFollowing(res.data);
      } catch (err) {
        console.error("Failed to fetch following list:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchFollowing();
    }
  }, [username]);


  return (
    <div className="max-w-5xl mx-auto py-4 px-6">
        <button  onClick={() => window.location.reload()} className='flex w-full max-w-max px-6 py-1 rounded justify- my-2 bg-gray-100
    bg-clip-padding
    backdrop-filter
    backdrop-blur-xl
    bg-opacity-10
    backdrop-saturate-100
    backdrop-contrast-100 '>
        Close
      </button>
      <h1
        className="text-3xl font-bold mb-6 text-white/90 cursor-pointer"
      >
        Followers
      </h1>

      {loading ? (
        <p className="text-white/60">Loading...</p>
      ) : following.length === 0 ? (
        <p className="text-white/60">You’re not Followers anyone yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {following.map((user) => (
            <div
              key={user.username}
              className="bg-white/5 p-4 rounded-xl shadow backdrop-blur-md border border-white/10 flex items-center gap-4"
            >
              <img
                src={user.profile_pic}
                alt={user.username}
                className="w-16 h-16 rounded-full border-2 border-white/20 object-cover"
              />
              <div>
                <Link
                  to={`/profile/${user.username}`}
                  className="text-lg font-semibold hover:underline"
                >
                  {user.first_name || user.username} {user.last_name}
                </Link>
                <p className="text-sm text-white/60">
                  {/* Joined on {new Date(user.joined_date).toLocaleDateString()} */}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowersPage;
