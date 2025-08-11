import { useEffect, useRef, useState } from "react";
import { Send, Paperclip, Undo2 } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import '../../new.css'
import Cookies from "js-cookie";
import axios from "axios";



export default function Listuser() {
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const RECEIVER = urlParams.get('username');
    const USERNAME = Cookies.get("username");
    const token = Cookies.get('access_token');
    const navigate = useNavigate();

    const [following, setFollowing] = useState([]);

    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const res = await axios.post("https://pixel-classes.onrender.com/api/Profile/following/", {
                    username: USERNAME,
                });
                setFollowing(res.data);
            } catch (err) {
                console.error("Failed to fetch following list:", err);
            } finally {
                setLoading(false);
            }
        };

        if (USERNAME) {
            fetchFollowing();
        }
    }, [USERNAME]);


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
                <div className="w-full sticky top-0 border-b border-white/10 glass z-10">
                    <div className="container mx-auto py-4 px-4 flex items-center justify-between">
                        <div className="flex gap-2 items-center justify-start ">

                            <button onClick={() => navigate("/profile")} className='flex w-full max-w-max px-3 py-2 rounded justify- my-2 bg-gray-100
    bg-clip-padding
    backdrop-filter
    backdrop-blur-xl
    bg-opacity-10
    backdrop-saturate-100
    backdrop-contrast-100 '>
                                <Undo2 className="" />
                            </button>

                            <h1 className="text-xl font-semibold text-center w-full truncate text-white">
                                Messages
                            </h1>

                        </div>

                    </div>
                </div>
                {/* Chat Area */}
                <div className="flex-1 flex flex-col mb-19">
                    <div className="flex-1 overflow-y-auto mb-3 space-y-4">
                        {loading ? (
                            <p className="text-white/60">Loading...</p>
                        ) : following.length === 0 ? (
                            <div className="text-white/60 p-4">
                                <p>You’re not following anyone yet.</p>

                                <div>
                                    <a href="/search">
                                    <button className="bg-white/10 hover:bg-white/20 rounded-full py-2 px-4 text-white/80 text-sm">Find Friends</button></a>
                                </div>

                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {following.map((user) => (
                                    <div
                                        key={user.username}
                                        className=" p-4  shadow backdrop-blur-md border border-white/10 flex items-center gap-4"
                                    >
                                        <a href={`chat/${user.username}`} className="text-lg flex font-semibold hover:underline">

                                            <img
                                                src={user.profile_pic}
                                                alt={user.username}
                                                className="w-9 h-9 lg:w-14 lg:h-14 rounded-full mr-2 border-2 border-white/20 object-cover"
                                            />
                                            <div>
                                                {user.first_name || user.username} {user.last_name}
                                                {/* <p className="text-sm text-white/60">
                                                Joined on {user.joined_date ? new Date(user.joined_date).toLocaleDateString() : ""}
                                            </p> */}
                                            </div>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
}
