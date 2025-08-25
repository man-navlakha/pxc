// components/SharePopup.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function SharePopup({ messageToShare, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const USERNAME = Cookies.get("username");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [followingRes, followersRes] = await Promise.all([
          axios.post("https://pixel-classes.onrender.com/api/Profile/following/", {
            username: USERNAME,
          }),
          axios.post("https://pixel-classes.onrender.com/api/Profile/followers/", {
            username: USERNAME,
          }),
        ]);
        const combined = [...followersRes.data, ...followingRes.data];
        const uniqueUsers = Array.from(new Map(combined.map(u => [u.username, u])).values());
        setUsers(uniqueUsers.filter(u => u.username !== USERNAME));
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [USERNAME]);

  const handleShare = (receiverUsername) => {
    const encoded = encodeURIComponent(messageToShare);
    navigate(`/chat/${receiverUsername}?prefillMessage=${encoded}`);
    onClose(); // close popup after navigation
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 text-white p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto shadow-lg">
        <h2 className="text-lg font-bold mb-4">Share With</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-2">
            {users.map((user) => (
              <li
                key={user.username}
                onClick={() => handleShare(user.username)}
                className="flex items-center gap-3 p-2 hover:bg-white/10 cursor-pointer rounded-lg"
              >
                <img
                  src={user.profile_pic || `https://i.pravatar.cc/150?u=${user.username}`}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium">{user.username}</span>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={onClose}
          className="mt-4 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
