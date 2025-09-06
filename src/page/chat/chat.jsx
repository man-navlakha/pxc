import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { Send, Undo2, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import "../../new.css";
import Listuser from "./Listuser";
import { motion, AnimatePresence } from "framer-motion";
import { Clipboard } from "lucide-react"; // Assuming you use lucide-react

import { verifiedUsernames } from "../../verifiedAccounts";
import VerifiedBadge from "../../componet/VerifiedBadge";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState(null);

  // popup for image/url
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // typing
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // sockets + scroll
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const listRef = useRef(null);
  const textareaRef = useRef(null);

  const { RECEIVER } = useParams();
  const USERNAME = Cookies.get("username");
  const token = Cookies.get("refresh_token");
  const navigate = useNavigate();
  const location = useLocation();

  // ---------- helpers ----------
  const getExtFromUrl = (raw) => {
    try {
      const u = new URL(raw);
      const path = u.pathname.toLowerCase();
      // strip trailing slash
      const clean = path.endsWith("/") ? path.slice(0, -1) : path;
      const dot = clean.lastIndexOf(".");
      return dot > -1 ? clean.slice(dot + 1) : "";
    } catch {
      // fallback – raw may already be a path
      const q = raw.split("?")[0].split("#")[0];
      const dot = q.lastIndexOf(".");
      return dot > -1 ? q.slice(dot + 1).toLowerCase() : "";
    }
  };

  const isYouTube = (url) => {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      if (host === "youtube.com" || host === "m.youtube.com") {
        const v = u.searchParams.get("v");
        return v ? `https://www.youtube.com/embed/${v}` : null;
      }
      if (host === "youtu.be") {
        const id = u.pathname.split("/").filter(Boolean)[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const IMAGE_EXT = useMemo(
    () => ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "avif"],
    []
  );
  const VIDEO_EXT = useMemo(
    () => ["mp4", "webm", "ogg", "mov", "m4v"],
    []
  );
  const AUDIO_EXT = useMemo(
    () => ["mp3", "wav", "ogg", "m4a", "aac", "flac"],
    []
  );
  const DOC_EXT = useMemo(
    () => ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv", "md"],
    []
  );

  // ---------- WebSocket + history ----------
  useEffect(() => {
    if (!USERNAME || !RECEIVER) return;
    const roomName = [USERNAME, RECEIVER].sort().join("__");
    const socket = new WebSocket(
      `wss://pixel-classes.onrender.com/ws/chat/${roomName}/`
    );
    socketRef.current = socket;

    socket.onopen = async () => {
      try {
        const res = await fetch(
          `https://pixel-classes.onrender.com/api/chatting/${roomName}/`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          // ensure chronological: oldest -> newest
          const hist = data
            .map((msg) => ({
              id: msg.id,
              sender: msg.sender,
              message: msg.content,
              seen: msg.seen_at,
              status: msg.is_seen ? "seen" : "sent",
            }))
            .sort((a, b) => String(a.id).localeCompare(String(b.id)));
          setMessages(hist);
          // after paint, snap to bottom
          setTimeout(() => scrollToBottom(true), 0);
        }
      } catch (e) {
        console.error("history load failed", e);
      }
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "seen") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.message_id ? { ...m, status: "seen", seen: new Date().toISOString() } : m
          )
        );
        return;
      }
      if (data.type === "chat") {
        setMessages((prev) => {
          // update optimistic by temp id/content if present
          const upd = [...prev];
          const idx = upd.findIndex(
            (m) =>
              (data.temp_id && m.temp_id === data.temp_id) ||
              (data.tempId && m.temp_id === data.tempId) ||
              (m.sender === data.sender && m.message === data.message && m.status === "sending")
          );
          if (idx !== -1) {
            upd[idx] = { ...upd[idx], id: data.id, status: "sent" };
            return upd;
          }
          // push new
          upd.push({
            id: data.id,
            sender: data.sender,
            receiver: data.receiver,
            message: data.message,
            status: "sent",
          });
          return upd;
        });
        // scroll to bottom when a truly new message arrives
        setTimeout(() => scrollToBottom(), 0);
      }
    };

    socket.onclose = () => console.log("❌ Disconnected");
    return () => socket.close();
  }, [USERNAME, RECEIVER]);

  // ---------- Seen on scroll ----------
  useEffect(() => {
    if (!messages.length || !RECEIVER) return;
    const onScroll = () => {
      const el = listRef.current;
      if (!el) return;
      messages
        .filter(
          (m) =>
            m.sender === RECEIVER &&
            m.status !== "seen" &&
            m.id &&
            !String(m.id).startsWith("temp-")
        )
        .forEach((m) => {
          const node = document.getElementById(`msg-${m.id}`);
          if (!node) return;
          const rect = node.getBoundingClientRect();
          const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
          if (fullyVisible) sendSeenStatus(m.id);
        });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [messages, RECEIVER]);

  // ---------- Auto scroll (smart) ----------
  const isAtBottom = () => {
    const el = listRef.current;
    if (!el) return true;
    const threshold = 500; // px
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    // (works because we'll set container to overflow-y-auto)
  };

  const scrollToBottom = (force = false) => {
    const el = listRef.current;
    if (!el) return;
    if (force || isAtBottom()) {
      el.scrollTop = el.scrollHeight;
    }
  };






  const handleSendUrl = () => {
    const url = imageUrl.trim();
    if (!url || socketRef.current?.readyState !== WebSocket.OPEN) return;

    // This reuses the sendMessage logic from your main component
    sendMessage(url);

    setImageUrl("");
    setShowImagePopup(false);
  };

  // Add this useEffect to your Chat component to handle Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowImagePopup(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);





  useEffect(() => {
    // on new messages, conditionally stick to bottom
    scrollToBottom();
  }, [messages]);

  // ---------- Actions ----------
  const sendSeenStatus = (messageId) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ type: "seen", message_id: messageId, seen_by: USERNAME })
      );
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "seen", seen: new Date().toISOString() } : msg
        )
      );
    }
  };

  const sendMessage = () => {
    if (!input.trim() || socketRef.current?.readyState !== WebSocket.OPEN) return;
    const temp_id = `temp-${Date.now()}`;
    const msg = {
      type: "chat",
      temp_id,
      sender: USERNAME,
      receiver: RECEIVER,
      message: input.trim(),
      status: "sending",
    };
    setMessages((prev) => [...prev, msg]);
    socketRef.current.send(JSON.stringify(msg));
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setTimeout(() => scrollToBottom(true), 0);
  };

  // ---------- Profile ----------
  useEffect(() => {
    if (!token) navigate("/");
    if (!RECEIVER) return;
    axios
      .post("https://pixel-classes.onrender.com/api/Profile/details/", { username: RECEIVER })
      .then((res) => setProfile(res.data))
      .catch(() => console.error("Failed to load profile"));
  }, [RECEIVER, token, navigate]);

  // ---------- Renderers ----------
  const renderMedia = (raw) => {
    if (!raw) return null;

    // data-url image
    if (raw.startsWith("data:image")) {
      return <img src={raw} alt="sent" className="rounded-lg max-w-xs" />;
    }

    // Markdown ![](url)
    if (raw.startsWith("![")) {
      const url = raw.slice(raw.indexOf("(") + 1, raw.lastIndexOf(")"));
      const yt = isYouTube(url);
      if (yt) {
        return (
          <div className="w-full max-w-xs aspect-video">
            <iframe
              className="w-full h-full rounded-lg"
              src={yt}
              title="YouTube"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      const ext = getExtFromUrl(url);
      if (IMAGE_EXT.includes(ext)) {
        return (
          <div className="max-w-full overflow-hidden">
            <img src={url} alt="image" className="rounded-lg w-full h-auto" />
          </div>
        );

      }
      if (VIDEO_EXT.includes(ext)) {
        return (
          <video controls className="rounded-lg max-w-xs">
            <source src={url} />
          </video>
        );
      }
      if (AUDIO_EXT.includes(ext)) {
        return (
          <audio controls className="w-full max-w-xs">
            <source src={url} />
          </audio>
        );
      }
      if (DOC_EXT.includes(ext)) {
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
          >
            📄 Open Document
          </a>
        );
      }
      // unknown -> show clickable link
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline text-blue-400">
          {url}
        </a>
      );
    }

    // Plain link (auto detect)
    try {
      const maybeUrl = new URL(raw); // will throw if not url
      const yt = isYouTube(raw);
      if (yt) {
        return (
          <div className="w-full max-w-min overflow-hidden">
            <iframe
              className="w-full h-full rounded-lg"
              src={yt}
              title="YouTube"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      const ext = getExtFromUrl(raw);
      if (IMAGE_EXT.includes(ext)) {
        return <img src={raw} alt="image" className="rounded-lg max-w-xs" />;
      }
      if (VIDEO_EXT.includes(ext)) {
        return (
          <video controls className="rounded-lg max-w-xs">
            <source src={raw} />
          </video>
        );
      }
      if (AUDIO_EXT.includes(ext)) {
        return (
          <audio controls className="w-full max-w-xs">
            <source src={raw} />
          </audio>
        );
      }
      if (DOC_EXT.includes(ext)) {
        return (
          <a
            href={raw}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
          >
            📄 Open Document
          </a>
        );
      }
      // generic link
      return (
        <a href={raw} target="_blank" rel="noopener noreferrer" className="underline text-blue-400">
          {maybeUrl.href}
        </a>
      );
    } catch {
      // not a URL → plain text
      return <p>{raw}</p>;
    }
  };






  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const prefill = params.get("prefillMessage");
    if (prefill) {
      setInput(decodeURIComponent(prefill));
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
      }
    }
  }, [location.search]);



  return (
    <div className="flex h-screen ccf bg-gray-900">
      {/* Left panel */}
      <div className="resize-x min-w-90 overflow-y-auto border-r border-gray-700 hidden lg:block">

        <Listuser />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col text-white">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 overflow-hidden flex items-center gap-3 px-4 py-3 border-b border-gray-700">
          <button onClick={() => navigate("/chat")} className="p-2">
            <Undo2 className="text-white" />
          </button>
          <img onClick={() => navigate(`/profile/${profile?.username}`)}
            src={profile?.profile_pic || "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png"}
            className="w-8 h-8 rounded-full"
          />
          <div onClick={() => navigate(`/profile/${profile?.username}`)} className="flex flex-col">
            <span className="font-semibold flex justify-center items-center gap-1">{profile?.username} {verifiedUsernames.has(profile?.username) && <VerifiedBadge size={24}  />}</span>
            <span className="text-xs text-gray-400">last seen</span>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={listRef}
          className="flex flex-1 flex-col overflow-y-auto px-4 py-4 space-y-1"
        // No justify-end: we keep natural flow, but we smart-scroll to bottom. 
        >
          {messages.map((msg, i) => {
            const isOwn = msg.sender === USERNAME;
            const prevMsg = messages[i - 1];
            const nextMsg = messages[i + 1];
            const isFirstOfGroup = !prevMsg || prevMsg.sender !== msg.sender;
            const isLastOfGroup = !nextMsg || nextMsg.sender !== msg.sender;

            let bubbleClasses = "rounded-2xl";
            if (isOwn) {
              if (isFirstOfGroup && !isLastOfGroup) bubbleClasses = "rounded-2xl rounded-br-sm";
              else if (!isFirstOfGroup && !isLastOfGroup) bubbleClasses = "rounded-2xl rounded-r-sm";
              else if (!isFirstOfGroup && isLastOfGroup) bubbleClasses = "rounded-2xl rounded-tr-sm";
            } else {
              if (isFirstOfGroup && !isLastOfGroup) bubbleClasses = "rounded-2xl rounded-bl-sm";
              else if (!isFirstOfGroup && !isLastOfGroup) bubbleClasses = "rounded-2xl rounded-l-sm";
              else if (!isFirstOfGroup && isLastOfGroup) bubbleClasses = "rounded-2xl rounded-tl-sm";
            }

            return (
              <div key={`${msg.id ?? "temp"}-${i}`} className="flex flex-col">
                <div
                  id={msg.id ? `msg-${msg.id}` : undefined}
                  className={`w-fit max-w-[75%] h-fit px-4 py-3 overflow-x-auto shadow-md whitespace-pre-wrap break-words text-sm md:text-base ${bubbleClasses} ${isOwn ? "ml-auto bg-emerald-500/30 text-white" : "mr-auto bg-gray-200/10 text-white"}`}
                >


                  {renderMedia(msg.message)}
                </div>

                {!isOwn && isLastOfGroup && (
                  <div className="flex items-center gap-1 mt-1">
                    <img
                      src={profile?.profile_pic || "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png"}
                      alt="receiver avatar"
                      className="w-5 h-5 rounded-full"
                    />
                  </div>
                )}

                {isOwn && isLastOfGroup && (
                  <p className="text-right text-xs text-gray-400 mt-1">
                    {msg.status === "seen" && msg.seen ? `✓ Seen ${msg.seen}` : "⏱︎ Sent"}
                  </p>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>





        <AnimatePresence>
          {showImagePopup && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              // Use this onClick to close the modal when clicking the backdrop
              onClick={() => setShowImagePopup(false)}
            >
              {/* Backdrop with Blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />

              {/* Modal Panel */}
              <motion.div
                // Stop propagation to prevent closing when clicking inside the modal
                onClick={(e) => e.stopPropagation()}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative z-10 flex w-full max-w-md flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl"
              >
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-white">Share Media</h2>
                  <p className="text-sm text-neutral-400">
                    Paste a link to an image, video, or YouTube URL.
                  </p>
                </div>

                {/* Input with Paste Button */}
                <div className="relative flex w-full items-center">
                  <input
                    type="text"
                    placeholder="https://... or youtu.be/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    // Auto-focus the input when the modal opens
                    autoFocus
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-10 text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <button
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setImageUrl(text);
                      } catch (err) {
                        console.error("Failed to read clipboard contents: ", err);
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 transition hover:text-white"
                    title="Paste from clipboard"
                  >
                    <Clipboard size={18} />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowImagePopup(false)}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendUrl}
                    className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-neutral-600 disabled:opacity-50 disabled:shadow-none"
                    disabled={!imageUrl.trim()}
                  >
                    Send
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>





        {/* Typing indicator */}
        {isTyping && (
          <p className="text-xs text-neutral-400 italic px-4 mb-1">
            typing...
          </p>
        )}

        {/* Input Form with Enhanced Glassmorphism */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          // --- REDESIGNED CLASSES ---
          className="sticky bottom-4 z-10 m-4 rounded-2xl border border-white/10 bg-black/20 shadow-2xl shadow-black/20 backdrop-blur-lg"
        >
          <div className="flex items-end gap-2 p-2">
            <textarea
              ref={textareaRef}
              style={{ maxHeight: "200px", overflowY: "auto" }}
              className="flex-1 resize-none bg-transparent px-3 py-2 text-base text-white placeholder-neutral-400 transition-colors duration-200 focus:outline-none focus:ring-0"
              rows={1}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setIsTyping(true);
                // Auto-resize logic
                const ta = e.target;
                ta.style.height = "auto";
                ta.style.height = `${ta.scrollHeight}px`;
                // Typing indicator timeout
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1500);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            {/* --- REDESIGNED ICON BUTTON --- */}
            <button
              type="button"
              onClick={() => setShowImagePopup(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              <ImageIcon className="h-5 w-5" />
            </button>

            {/* --- REDESIGNED SEND BUTTON --- */}
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:shadow-none"
              disabled={!input.trim()}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
