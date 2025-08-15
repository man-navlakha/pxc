import { useEffect, useRef, useState } from "react";
import { Send, Paperclip, Undo2 } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import '../../new.css'
import Cookies from "js-cookie";
import axios from "axios";



export default function Listuser() {

    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const RECEIVER = urlParams.get('username');
    const USERNAME = Cookies.get("username");
    const token = Cookies.get('access_token');
    const navigate = useNavigate();

    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [alllist, setalllist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [followingRes, followersRes] = await Promise.all([
                    axios.post("https://pixel-classes.onrender.com/api/Profile/following/", {
                        username: USERNAME,
                    }),
                    axios.post("https://pixel-classes.onrender.com/api/Profile/followers/", {
                        username: USERNAME,
                    }),
                ]);

                const followingData = followingRes.data;
                const followersData = followersRes.data;

                // Merge and deduplicate by username
                const combinedList = [...followersData, ...followingData];
                const deduplicatedList = Array.from(
                    new Map(combinedList.map(user => [user.username, user])).values()
                );

                // Fetch last message for each user in deduplicated list
                const updatedList = await Promise.all(
                    deduplicatedList.map(async (user) => {
                        try {
                            const roomName = [USERNAME, user.username].sort().join("__");
                            const res = await fetch(
                                `https://pixel-classes.onrender.com/api/chatting/${roomName}/`
                            );
                            const messages = await res.json();

                            const lastMsg = messages.length ? messages[messages.length - 1] : null;

                            return {
                                ...user,
                                lastMessage: lastMsg ? lastMsg.content : "",
                                lastTime: lastMsg ? lastMsg.timestamp : null,
                                lastSender: lastMsg ? lastMsg.sender : null,
                                isSeen: lastMsg ? lastMsg.is_seen : true,

                            };
                        } catch (err) {
                            console.error(`Failed to fetch last message for ${user.username}`, err);
                            return { ...user, lastMessage: "", lastTime: null, isSeen: true };
                        }
                    })
                );

                // Sort by last message time descending
                updatedList.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));

                setalllist(updatedList);


                // setFollowing(followingData);
                // setFollowers(followersData);
                // setalllist(updatedList); // ✅ finally set it with enriched data

            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (USERNAME) {
            fetchData();
        }
    }, [USERNAME]);



function toISOStringCompat(dateString) {
  // Input: "2025-08-14 13:45"
  const [date, time] = dateString.split(" ");
  // Add seconds if missing
  const fullTime = time.length === 5 ? `${time}:00` : time;
  return `${date}T${fullTime}`;
}

    // Unified profile and posts fetch
    useEffect(() => {
        !token && navigate("/")
        const userToFetch = RECEIVER;
        if (!userToFetch) return;
        axios.post('https://pixel-classes.onrender.com/api/Profile/details/', { username: userToFetch })
            .then(res => setProfile(res.data))
            .catch(() => setError("Failed to load profile details"))
    }, [RECEIVER, token]);

    return (
        <>
            <div className="min-h-screen ccf flex flex-col text-white">


                {/* Header */}
                <div className="sticky top-0 bg-gray-900 flex items-center justify-start gap-3 px-4 py-3 border-b border-gray-700 z-10">
                    <button onClick={() => navigate("/profile")} className="p-2">
                        <Undo2 className="text-white" />
                    </button>
                    <h1 className="text-xl font-semibold text-white">
                        Messages
                    </h1>
                </div>
                {/* Chat Area */}
                <div className="flex-1 flex flex-col mb-19">
                    <div className="flex-1 overflow-y-auto mb-3 space-y-4">
                        {loading ? (
                            <p className="text-white/60">Loading...</p>
                        ) : alllist.length === 0 ? (
                            <div className="text-white/60 p-4">
                                <p>You’re not following anyone yet.</p>

                                <div>
                                    <a href="/search">
                                        <button className="bg-white/10 hover:bg-white/20 rounded-full py-2 px-4 text-white/80 text-sm">Find Friends</button></a>
                                </div>

                            </div>
                        ) : (
                            <div className="grid grid-cols-1">
                                {alllist.map((user) => {
                                    // console.log("User:", {
                                    //     username: user.username,
                                    //     lastSender: user.lastSender,
                                    //     isSeen: user.isSeen,
                                    // });

                                    return (
                                        <div
                                            key={user.username}
                                            className="p-4 shadow backdrop-blur-md border-y border-white/10 flex items-center gap-4"
                                        >
                                            <a href={`/chat/${user.username}`} className="flex items-center gap-3 w-full">
                                                <img
                                                    src={user.profile_pic}
                                                    alt={user.username}
                                                    className="w-9 h-9 lg:w-14 lg:h-14 rounded-full border-2 border-white/20 object-cover"
                                                />
                                                <div className="flex flex-col flex-1">
                                                    <span className="font-semibold">
                                                        {user.username}
                                                    </span>
                                                  <div className="w-64 overflow-hidden">
  <span className="text-sm text-white/60 truncate block">
    {user.lastMessage || `${user.first_name} ${user.last_name}`}
  </span>
</div>


                                                </div>

                                                {/* 🔵 Blue dot if the last message is from them and is not seen */}
                                                {user.lastSender && user.lastSender !== USERNAME && user.isSeen === false && (
                                                    <span className="w-3 h-3 rounded-full bg-blue-500 ml-2 inline-block"></span>
                                                )}

                                               {user.lastTime && (
  <span className="text-xs text-white/40 ml-2">
    {new Date(toISOStringCompat(user.lastTime)).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}
  </span>
)}


                                            </a>
                                        </div>
                                    );
                                })}



                            </div>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
}
