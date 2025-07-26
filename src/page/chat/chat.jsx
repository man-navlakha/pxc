import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import '../../new.css'
import Cookies from "js-cookie";



export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const RECEIVER = urlParams.get('username');
  const USERNAME = Cookies.get("username");
  const token = Cookies.get('access_token');
  const navigate = useNavigate();

  console.log(USERNAME, RECEIVER)
  useEffect(() => {
    console.log(USERNAME, RECEIVER)
    const sender = USERNAME;
    const receiver = RECEIVER;
    const roomName = `${sender}__${receiver}`;

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
      .catch((err) => console.error("Failed to fetch chat history:", err));

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

  return (
    <div className="min-h-screen ccf flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="w-full sticky top-0 border-b border-white/10 backdrop-blur-md bg-white/10 z-10">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-center w-full truncate text-white">
            Chat with Pixel
          </h1>
          <div className="w-[100px]" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col px-4 py-4">
        <div className="flex-1 overflow-y-auto mb-3 px-1 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-xl md:max-w-[20rem] lg:max-w-xl px-4 py-3 rounded-2xl shadow-md whitespace-pre-wrap backdrop-blur-sm ${
                msg.sender === USERNAME
                  ? "ml-auto bg-blue-600/30 border text-right border-blue-800/60"
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
