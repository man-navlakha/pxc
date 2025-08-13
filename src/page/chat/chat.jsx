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
      setMessages(prev =>
  prev.map(msg =>
    msg.id === messageId || msg.temp_id === messageId
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
            seen: msg.seen_at, // ✅ Must be string like "2025-08-13T08:00:00Z"
            status: msg.is_seen ? "seen" : "sent",
          }))
        );

      }
    };

    socket.onmessage = (e) => {
  const data = JSON.parse(e.data);

  // Normalize temp_id from server
  const incomingTempId = data.temp_id || data.tempId || null;

  if (data.type === "seen") {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === data.message_id
          ? { ...msg, status: "seen", seen: new Date().toISOString() }
          : msg
      )
    );
    return;
  }

  if (data.type === "chat") {
    setMessages(prev => {
      const tempIndex = prev.findIndex(
        m => m.temp_id && m.temp_id === incomingTempId
      );

      if (tempIndex !== -1) {
        const updated = [...prev];
        updated[tempIndex] = {
          ...updated[tempIndex],
          id: data.id,
          status: "sent",
        };
        return updated;
      }

      if (prev.some(m => m.id && m.id === data.id)) return prev;

      return [
        ...prev,
        {
          id: data.id,
          sender: data.sender,
          receiver: data.receiver,
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
        ) < 600;
      if (atBottom) {
        messages
          .filter(
            (m) =>
              m.sender === RECEIVER &&
              m.status !== "seen" &&
              !m.id.toString().startsWith("temp-")
          )
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
  // Send message// Send message
  const sendMessage = () => {
    if (!input.trim()) return;

    const temp_id = `temp-${Date.now()}`;
    const msg = {
      type: "chat",
      temp_id, // ✅ match server
      sender: USERNAME,
      receiver: RECEIVER,
      message: input.trim(),
      status: "sending",
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
      .post("https://pixel-classes.onrender.com/api/Profile/details/", {
        username: RECEIVER,
      })
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
      <div className="sticky top-0 bg-gray-100 bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-10 backdrop-saturate-100 backdrop-contrast-100 flex items-center gap-3 px-4 py-3 border-b border-gray-300">
        <button onClick={() => navigate("/chat")} className="p-2">
          <Undo2 className="text-white" />
        </button>
        <img
          src={profile?.profile_pic || "https://via.placeholder.com/150"}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-white">{profile?.username}</span>
          <span className="text-xs text-gray-500">last seen </span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col px-4 py-4">
        <div className="flex-1 overflow-y-auto mb-3 px-1 space-y-1">
          {messages.map((msg, i) => {
            const isOwn = msg.sender === USERNAME;

            const prevMsg = messages[i - 1];
            const nextMsg = messages[i + 1];

            const isFirstOfGroup = !prevMsg || prevMsg.sender !== msg.sender;
            const isLastOfGroup = !nextMsg || nextMsg.sender !== msg.sender;

            let bubbleClasses = "rounded-2xl";

            if (isOwn) {
              if (isFirstOfGroup && !isLastOfGroup) {
                bubbleClasses = "rounded-2xl rounded-br-sm";
              } else if (!isFirstOfGroup && !isLastOfGroup) {
                bubbleClasses = "rounded-2xl rounded-r-sm";
              } else if (!isFirstOfGroup && isLastOfGroup) {
                bubbleClasses = "rounded-2xl rounded-tr-sm";
              }
            } else {
              if (isFirstOfGroup && !isLastOfGroup) {
                bubbleClasses = "rounded-2xl rounded-bl-sm";
              } else if (!isFirstOfGroup && !isLastOfGroup) {
                bubbleClasses = "rounded-2xl rounded-l-sm";
              } else if (!isFirstOfGroup && isLastOfGroup) {
                bubbleClasses = "rounded-2xl rounded-tl-sm";
              }
            }

            const seenStatus = msg.status === "seen";
            const seenHasValue = Boolean(msg.seen);

            return (
              <div key={`${msg.id}-${i}`} className="flex flex-col">
                <div
                  className={`w-fit max-w-[75%] px-4 py-3 shadow-md whitespace-pre-wrap break-words text-sm md:text-base ${bubbleClasses} ${isOwn
                      ? "ml-auto bg-emerald-500/30 text-white"
                      : "mr-auto bg-gray-200/10 text-white"
                    }`}
                >
                  <p>{msg.message}</p>
                </div>

                {/* ✅ Only show below last bubble of own messages */}
                {isOwn && isLastOfGroup && (
                  <p className="text-right text-xs text-gray-400 mt-1">
                    {seenStatus && seenHasValue
                      ? `✓ Seen ${msg.seen}`
                      : "⏱︎ Sent"}
                  </p>
                )}
              </div>
            );
          })}

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
