import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { Send, Undo2 } from "lucide-react";
import axios from "axios";
import "../../new.css";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const sendQueueRef = useRef([]); // queue messages until socket opens
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const { RECEIVER } = useParams();
  const USERNAME = Cookies.get("username");
  const token = Cookies.get("access_token");
  const navigate = useNavigate();
  const location = useLocation();

    // Send "seen"
  const sendSeenStatus = (messageId) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "seen",
          message_id: messageId,
          seen_by: USERNAME,
        })
      );
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId || msg.tempId === messageId
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    }
  };

  // WebSocket connection + history
  useEffect(() => {
    if (!USERNAME || !RECEIVER) return;
    const roomName = [USERNAME, RECEIVER].sort().join("__");
    const socket = new WebSocket(
      `wss://pixel-classes.onrender.com/ws/chat/${roomName}/`
    );
    socketRef.current = socket;

    socket.onopen = async () => {
      console.log("✅ Connected to WebSocket");
      const res = await fetch(
        `https://pixel-classes.onrender.com/api/chatting/${roomName}/`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(
          data.map((msg) => ({
            id: msg.id,
            sender: msg.sender,
            message: msg.content,
            status: msg.is_seen ? "seen" : "sent",
          }))
        );
      }
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      // Seen event
      if (data.type === "seen") {
  setMessages(prev =>
    prev.map(msg => {
      // Exact ID match
      if (msg.id === data.message_id) {
        return { ...msg, status: "seen" };
      }
      // Fallback match for optimistic message
      if (
        msg.sender === USERNAME &&
        msg.message === data.message &&
        msg.status !== "seen"
      ) {
        return { ...msg, status: "seen" };
      }
      return msg;
    })
  );
}


      // Chat event
    if (data.type === "chat") {
  setMessages(prev => {
    // Find the optimistic temp message
    const tempIndex = prev.findIndex(m => m.id === data.temp_id);
    if (tempIndex !== -1) {
      const updated = [...prev];
      updated[tempIndex] = {
        ...updated[tempIndex],
        id: data.id, // replace with real backend ID
        status: "sent"
      };
      return updated;
    }

    // Avoid duplicates
    if (prev.some(m => m.id === data.id)) return prev;

    return [
      ...prev,
      {
        id: data.id,
        sender: data.sender,
        message: data.message,
        status: "sent",
      },
    ];
  });
}


    };

    socket.onclose = () => console.log("❌ Disconnected");
    return () => socket.close();
  }, [USERNAME, RECEIVER]);

  // Seen on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!messages.length || !messagesEndRef.current) return;
      const atBottom =
        Math.abs(
          messagesEndRef.current.getBoundingClientRect().bottom -
            window.innerHeight
        ) < 50;
      if (atBottom) {
        messages
          .filter((m) => m.sender === RECEIVER && m.status !== "seen")
          .forEach((m) => sendSeenStatus(m.id));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [messages, RECEIVER]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (!input.trim()) return;
    const tempId = `temp-${Date.now()}`;
    const msg = {
      type: "chat",
      tempId,
      sender: USERNAME,
      receiver: RECEIVER,
      message: input.trim(),
      status: "sent",
    };
    setMessages((prev) => [...prev, msg]);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  // handle Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Load profile (unchanged)
  useEffect(() => {
    if (!token) navigate("/");
    if (!RECEIVER) return;
    axios
      .post("https://pixel-classes.onrender.com/api/Profile/details/", { username: RECEIVER })
      .then((res) => setProfile(res.data))
      .catch(() => console.error("Failed to load profile"));
  }, [RECEIVER, token, navigate]);

  return (
    <div className="min-h-screen ccf flex flex-col text-white mx-auto">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16" />
        </div>
      )}

      {/* Header */}
      <div className="w-full sticky top-0 border-b border-white/10 glass z-10">
        <div className="container mx-auto py-4 px-4 flex items-center justify-start gap-2">
          <button onClick={() => navigate("/chat")} className="flex w-full max-w-max px-3 py-2 rounded">
            <Undo2 />
          </button>
          <a href={`/profile/${profile?.username}`}>
            <div className="flex gap-2 items-center justify-start">
              <img
                className="w-9 h-9 lg:w-14 lg:h-14 rounded-full border-4 border-white/30 shadow-lg object-cover"
                src={profile?.profile_pic || "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png"}
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

      {/* Chat area */}
      <div className="flex-1 flex flex-col px-4 py-4">
        <div className="flex-1 overflow-y-auto mb-3 px-1 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={msg.id + "-" + i}
              className={`w-fit max-w-[75%] px-4 py-3 rounded-2xl shadow-md whitespace-pre-wrap break-words text-sm md:text-base ${
                msg.sender === USERNAME ? "ml-auto bg-emerald-600/30 rounded-br-sm border border-emerald-800/60" : "mr-auto bg-white/10 rounded-tl-sm border border-white/10"
              }`}
            >
              <p>{msg.message}</p>
              {msg.sender === USERNAME && (
                <p className="text-right text-xs text-gray-400 mt-1">
                  {msg.status === "seen" ? "✔ Seen" : "⏱︎ Sent"}
                </p>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {isTyping && <p className="text-xs text-gray-400 italic px-2 mt-1">You are typing...</p>}

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
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
              }}
              onKeyDown={handleKeyDown}
            />
            <button type="submit" className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50" disabled={!input.trim()}>
              <Send className="h-full w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
