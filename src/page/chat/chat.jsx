import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { Send, Undo2 } from "lucide-react";
import "../../new.css";
import axios from "axios";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const { RECEIVER } = useParams();
  const USERNAME = Cookies.get("username");
  const token = Cookies.get("access_token");
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch chat history & open WebSocket
  useEffect(() => {
    if (!USERNAME || !RECEIVER) return;
    setLoading(true);

    const sender = USERNAME;
    const receiver = RECEIVER;
    const roomName = [sender, receiver].sort().join("__");

    // Fetch old messages
    fetch(`https://pixel-classes.onrender.com/api/chatting/${roomName}/`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(
            data.map(msg => ({
              id: msg.id,
              sender: msg.sender,
              message: msg.content,
              status: msg.is_seen ? "seen" : "sent",
            }))
          );
        } else {
          console.error("Unexpected data format:", data);
        }
      })
      .catch(err => console.error("Failed to fetch chat history:", err))
      .finally(() => setLoading(false));

    // Open WebSocket
    const socket = new WebSocket(
      `wss://pixel-classes.onrender.com/ws/chat/${roomName}/`
    );
    socketRef.current = socket;

    socket.onopen = () => console.log("✅ Connected to WebSocket");

    socket.onmessage = e => {
      const data = JSON.parse(e.data);

      if (data.type === "seen") {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === data.message_id ? { ...msg, status: "seen" } : msg
          )
        );
      }

      else if (data.type === "chat") {
        setMessages(prev => {
          // Replace optimistic message if it matches by sender + message
          const existingIndex = prev.findIndex(
            m => m.sender === USERNAME && m.message === data.message && String(m.id).startsWith("temp-")
          );

          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = {
              id: data.id,
              sender: data.sender,
              message: data.message,
              status: "sent",
            };
            return updated;
          }

          // Avoid duplicates by id
          if (prev.some(m => m.id === data.id)) return prev;

          return [
            ...prev,
            {
              id: data.id,
              sender: data.sender,
              message: data.message,
              status: "sent",
            }
          ];
        });

        // Send seen status only if from other user
        if (data.sender !== USERNAME) {
          sendSeenStatus(data.id);
        }
      }
    };

    socket.onerror = err => console.error("WebSocket error:", err);
    socket.onclose = () => console.log("❌ WebSocket disconnected");

    const sendSeenStatus = messageId => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "seen",
            message_id: messageId,
            seen_by: USERNAME,
          })
        );

        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, status: "seen" } : msg
          )
        );
      }
    };

    return () => socket.close();
  }, [USERNAME, RECEIVER]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (!input.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const msg = {
      type: "chat",
      id: tempId,
      sender: USERNAME,
      receiver: RECEIVER,
      message: input.trim(),
      status: "sent",
    };

    // Optimistic UI
    setMessages(prev => [...prev, msg]);

    // Send over WebSocket
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    } else {
      console.warn("WebSocket not open, cannot send message yet");
    }

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Fetch profile
  useEffect(() => {
    if (!token) navigate("/");
    if (!RECEIVER) return;
    axios
      .post("https://pixel-classes.onrender.com/api/Profile/details/", {
        username: RECEIVER,
      })
      .then(res => setProfile(res.data))
      .catch(() => console.error("Failed to load profile details"));
  }, [RECEIVER, token, navigate]);

  return (
    <div className="min-h-screen ccf flex flex-col text-white mx-auto">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className=" ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        </div>
      )}
      {/* Header */}
      <div className="w-full sticky top-0 border-b border-white/10 backdrop-blur-md bg-white/10 z-10">
        <div className="container mx-auto py-4 px-4 flex items-center justify-start gap-2">
          <button
            onClick={() => navigate("/chat")}
            className="flex w-full max-w-max px-3 py-2 rounded justify- my-2 bg-gray-100 bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-10 backdrop-saturate-100 backdrop-contrast-100 "
          >
            <Undo2 className="" />
          </button>
          <a href={`/profile/${profile?.username}`}>
            <div className="flex gap-2 items-center justify-start">
              <img
                className="w-9 h-9 lg:w-14 lg:h-14 rounded-full border-4 border-white/30 shadow-lg object-cover"
                src={
                  profile?.profile_pic
                    ? profile.profile_pic
                    : "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png"
                }
                alt="Profile"
              />
              <h1 className="text-xl lg:text-3xl font-semibold text-center w-full truncate text-white">
                {profile?.username || "Guest"}
              </h1>
            </div>
          </a>
          <div className="w-[100px]" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col px-4 py-4">
        <div className="flex-1 overflow-y-auto mb-3 px-1 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`w-fit max-w-[75%] px-4 py-3 rounded-2xl shadow-md whitespace-pre-wrap backdrop-blur-sm break-words text-sm md:text-base ${msg.sender === USERNAME
                ? "ml-auto bg-emerald-600/30 border border-emerald-800/60"
                : "mr-auto bg-white/10 border border-white/10"
                }`}
            >
              <p>{msg.message}</p>

              {/* Show status only for sender's messages */}
              {msg.sender === USERNAME && (
                <p className="text-right text-xs text-gray-400 mt-1">
                  {msg.status === "seen" ? "✔ Seen" : "⏱︎ Sent"}
                </p>
              )}

            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {isTyping && (
          <p className="text-xs text-gray-400 italic px-2 mt-1">
            You are typing...
          </p>
        )}

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="sticky bottom-4 z-10 rounded-2xl border border-gray-600/50 shadow-xl bg-white/10 backdrop-blur-md p-3 flex flex-col gap-1"
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              style={{ maxHeight: "200px", overflowY: "auto" }}
              className="flex-1 resize-none px-4 py-2 rounded-xl bg-transparent text-white placeholder-white/70 focus:outline-none focus:ring-0"
              rows={1}
              placeholder="Type your message..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setIsTyping(true);

                const textarea = textareaRef.current;
                if (textarea) {
                  textarea.style.height = "auto";
                  textarea.style.height = textarea.scrollHeight + "px";
                }

                if (typingTimeoutRef.current)
                  clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(
                  () => setIsTyping(false),
                  1000
                );
              }}
              onKeyDown={handleKeyDown}
            />

            <button
              type="submit"
              className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
              disabled={!input.trim()}
            >
              <Send className="h-full w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
