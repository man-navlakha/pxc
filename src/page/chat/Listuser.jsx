import { useEffect, useState } from "react";
import { Undo2 } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import '../../new.css';
import Cookies from "js-cookie";
import axios from "axios";

export default function Listuser() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const RECEIVER = urlParams.get('username');
  const USERNAME = Cookies.get("username");
  const token = Cookies.get('access_token');
  const navigate = useNavigate();

  const [prefillMessage, setPrefillMessage] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const messageFromUrl = params.get("prefillMessage");
        if (messageFromUrl) {
            setPrefillMessage(decodeURIComponent(messageFromUrl));
        }
    }, [location.search]);

  const [search, setSearch] = useState("");
  const [alllist, setAlllist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  // Follow a user
  const follow = async (targetUsername) => {
    try {
      await axios.post("https://pixel-classes.onrender.com/api/Profile/follow/", {
        follower: USERNAME,
        following: targetUsername,
      });
    } catch (error) {
      console.error("Follow failed:", error);
    }
  };

  // Search filter
  const filteredUsers = alllist.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const username = user.username.toLowerCase();
    const searchTerm = search.toLowerCase();

    return username.includes(searchTerm) || fullName.includes(searchTerm);
  });

  // Fetch messages + users, poll every 3 sec
  useEffect(() => {
    if (!USERNAME) return;

    let intervalId;

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

        const combinedList = [...followersRes.data, ...followingRes.data];
        const deduplicatedList = Array.from(
          new Map(combinedList.map(user => [user.username, user])).values()
        );

        const updatedList = await Promise.all(
          deduplicatedList.map(async (user) => {
            try {
              const roomName = [USERNAME, user.username].sort().join("__");
              const res = await fetch(`https://pixel-classes.onrender.com/api/chatting/${roomName}/`);
              const messages = await res.json();
              const lastMsg = messages.length ? messages[messages.length - 1] : null;

              return {
                ...user,
                lastMessage: lastMsg ? lastMsg.content : "",
                lastTime: lastMsg ? lastMsg.timestamp : null,
                lastSender: lastMsg ? lastMsg.sender : null,
                isSeen: lastMsg ? lastMsg.is_seen : true,
              };
            } catch {
              return { ...user, lastMessage: "", lastTime: null, isSeen: true };
            }
          })
        );

        updatedList.sort((a, b) => new Date(b.lastTime || 0) - new Date(a.lastTime || 0));
        setAlllist(updatedList);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    intervalId = setInterval(fetchData, 3000);

    return () => clearInterval(intervalId);
  }, [USERNAME]);

  // Profile details fetch
  useEffect(() => {
    if (!token) return navigate("/");
    if (!RECEIVER) return;

    axios.post('https://pixel-classes.onrender.com/api/Profile/details/', { username: RECEIVER })
      .then(res => setProfile(res.data))
      .catch(() => setError("Failed to load profile details"));
  }, [RECEIVER, token]);

  // ISO compatibility for timestamps
  function toISOStringCompat(dateString) {
    const [date, time] = dateString.split(" ");
    const fullTime = time.length === 5 ? `${time}:00` : time;
    return `${date}T${fullTime}`;
  }

  return (
    <>
      <div className="min-h-screen ccf flex flex-col text-white">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 flex items-center justify-start gap-3 px-4 py-3 border-b border-gray-700 z-10">
          <button onClick={() => navigate("/profile")} className="p-2">
            <Undo2 className="text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Messages</h1>
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
                    <button className="bg-white/10 hover:bg-white/20 rounded-full py-2 px-4 text-white/80 text-sm">Find Friends</button>
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3 overflow-hidden flex items-center mt-3 justify-center max-w-screen">
                  <input
                    className="bg-[#222630] px-4 py-3 outline-none w-full m-2 max-w-[90%] text-white rounded-lg border-2 transition-colors duration-100 border-solid focus:border-[#596A95] border-[#2B3040]"
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by username..."
                    value={search}
                    type="text"
                  />
                </div>

                <div className="flex flex-col w-full">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) =>
                      search === USERNAME ? (
                        <span key={index}>
                          You can't find yourself in this search page
                        </span>
                      ) : (
                        <div
                          key={user.username}
                          className="p-4 shadow backdrop-blur-md border-y border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all"
                        >
                          <a href={`/chat/${user.username}`} className="flex items-center gap-3 w-full">
                            <img
                              src={user.profile_pic || `https://i.pravatar.cc/150?u=${user.username}`}
                              alt={user.username}
                              className="w-9 h-9 lg:w-14 lg:h-14 rounded-full border-2 border-white/20 object-cover"
                            />
                            <div className="flex flex-col flex-1 max-w-full">
                              <span className="font-semibold">{user.username}</span>
                              <div className="w-64 max-w-[220px] overflow-hidden">
                                <span className="text-sm text-white/60 truncate block">
                                  {user.lastMessage || `${user.first_name} ${user.last_name}`}
                                </span>
                              </div>
                            </div>
                            <div className="min-w-11 flex gap-2 items-center">
                              {/* Blue dot */}
                              {user.lastSender && user.lastSender !== USERNAME && user.isSeen === false && (
                                <span className="w-3 h-3 rounded-full bg-blue-500 ml-2 inline-block"></span>
                              )}
                              {/* Timestamp */}
                              {user.lastTime && (
                                <span className="text-xs text-white/40">
                                  {new Date(toISOStringCompat(user.lastTime)).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                          </a>
                        </div>
                      )
                    )
                  ) : search.trim() === "" ? (
                    <p className="text-white/60 text-center">Start typing to search users.</p>
                  ) : (
                    <p className="text-white/60 text-center">No users found.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
