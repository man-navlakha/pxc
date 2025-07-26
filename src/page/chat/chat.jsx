import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Send, Paperclip, Undo2 } from "lucide-react";
import { useLocation } from 'react-router-dom';
import '../../new.css'
import Cookies from "js-cookie";
import axios from "axios";



export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
  
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const {RECEIVER} =  useParams();
  const USERNAME = Cookies.get("username");
  const token = Cookies.get('access_token');
  const navigate = useNavigate();

  console.log(USERNAME, RECEIVER)
  useEffect(() => {
    setLoading(true)
    console.log(USERNAME, RECEIVER)
   const sender = USERNAME;
const receiver = RECEIVER;
const roomName = [sender, receiver].sort().join("__");


    // Fetch old messages
    fetch(`https://pixel-classes.onrender.com/api/chatting/${roomName}/`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map((msg) => ({
            sender: msg.sender,
            message: msg.content,
          }));
          setMessages(formatted);
        } else {
          console.error("Unexpected data format:", data);
        }
      })
      .catch((err) => console.error("Failed to fetch chat history:", err))
      .finally(() => setLoading(false));

    // Open WebSocket connection
    const socket = new WebSocket(`wss://pixel-classes.onrender.com/ws/chat/${roomName}/`);
    socketRef.current = socket;

    socket.onopen = () => console.log("✅ Connected to WebSocket");

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, data]);
    };

    socket.onclose = () => console.log("❌ WebSocket disconnected");

    return () => socket.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const msg = {
      sender: USERNAME,
      receiver: RECEIVER,
      message: input.trim(),
    };

    socketRef.current.send(JSON.stringify(msg));
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
    <div className="min-h-screen ccf flex flex-col text-white">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        </div>
      )}
      {/* Header */}  
      <div className="w-full sticky top-0 border-b border-white/10 backdrop-blur-md bg-white/10 z-10">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
    <button  onClick={() => navigate("/chat")} className='flex w-full max-w-max px-3 py-2 rounded justify- my-2 bg-gray-100
    bg-clip-padding
    backdrop-filter
    backdrop-blur-xl
    bg-opacity-10
    backdrop-saturate-100
    backdrop-contrast-100 '>
      <Undo2 className=""/>
      </button>
            <div className="flex gap-2 items-center">
             <img
                        className="w-14 h-14 rounded-full border-4 border-white/30 shadow-lg object-cover"
                        src={profile?.profile_pic
                            ? profile.profile_pic
                            : "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png"}
                            alt="Profile"
                            />
          <h1 className="text-3xl font-semibold text-center w-full truncate text-white">
           {profile?.username || "Guest"}
          </h1>
                            </div>
          <div className="w-[100px]" />
        </div>
      </div>
 {/* Chat Area */}
      <div className="flex-1 flex flex-col px-4 py-4">
        <div className="flex-1 overflow-y-auto mb-3 px-1 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`w-fit max-w-[75%] px-4 py-3 rounded-2xl shadow-md whitespace-pre-wrap backdrop-blur-sm break-words text-sm md:text-base ${
                msg.sender === USERNAME
                  ? "ml-auto bg-green-600/30 border border-blue-800/60"
                  : "mr-auto bg-white/10 border border-white/10"
              }`}
            >
              {msg.message}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>


        {isTyping && (
          <p className="text-xs text-gray-400 italic px-2 mt-1">You are typing...</p>
        )}

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="sticky bottom-4 z-10 rounded-2xl border-t border-white/50 shadow-xl bg-white/10 backdrop-blur-md p-3 flex flex-col gap-1"
        >
          <div className="flex items-end gap-2">
             {/* <button
              type="submit"
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              disabled={!input.trim()}
            >
              <Paperclip className="h-full w-4" />
            </button> */}
            <textarea
              className="flex-1 resize-none px-4 py-2 rounded-xl bg-transparent border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-0"
              rows={1}
              placeholder="Type your message..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setIsTyping(true);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
              }}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              disabled={!input.trim()}
            >
              <Send className="h-full w-4" />
            </button>
          </div>
          {/* <p className="text-xs text-gray-400 px-2 mt-1">
            Press <kbd className="bg-gray-700 px-1 rounded">Enter</kbd> to send, <kbd className="bg-gray-700 px-1 rounded">Shift</kbd> + <kbd className="bg-gray-700 px-1 rounded">Enter</kbd> for newline.
          </p> */}
        </form>
      </div>
    </div>
  );
}
