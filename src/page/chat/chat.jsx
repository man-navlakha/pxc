import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { Send, Undo2, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import "../../new.css";
import Listuser from "./Listuser";

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
  const token = Cookies.get("access_token");
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
    const threshold = 50; // px
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
        return <img src={url} alt="image" className="rounded-lg max-w-xs" />;
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
    <div className="flex h-screen ccf">
      {/* Left panel */}
      <div
        className="resize-x overflow-auto border-r border-gray-700 hidden md:hidden lg:block"
        style={{ minWidth: "200px", maxWidth: "50%" }}
      >
        <Listuser />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col text-white">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 overflow-hidden flex items-center gap-3 px-4 py-3 border-b border-gray-700">
          <button onClick={() => navigate("/chat")} className="p-2">
            <Undo2 className="text-white" />
          </button>
          <img
            src={profile?.profile_pic || "https://via.placeholder.com/150"}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex flex-col">
            <span className="font-semibold">{profile?.username}</span>
            <span className="text-xs text-gray-400">last seen</span>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-1 flex flex-col justify-end"
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
                  className={`w-fit max-w-[75%] h-fit px-4 py-3 overflow-x-auto shadow-md whitespace-pre-wrap break-words text-sm md:text-base ${bubbleClasses} ${isOwn ? "ml-auto bg-emerald-500/30 text-white" : "mr-auto bg-gray-200/10 text-white"
                    }`}
                >
                  {renderMedia(msg.message)}
                </div>

                {!isOwn && isLastOfGroup && (
                  <div className="flex items-center gap-1 mt-1">
                    <img
                      src={profile?.profile_pic || "https://via.placeholder.com/150"}
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

        {/* Image/URL popup */}
        {showImagePopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-96 flex flex-col gap-4">
              <h2 className="text-white font-semibold text-lg">Paste media link</h2>
              <p className="text-xs text-gray-400">
                Works with images, videos, audio, docs, and YouTube URLs.
              </p>
              <input
                type="text"
                placeholder="https://example.com/file.png or https://youtu.be/ID"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="px-3 py-2 rounded-lg bg-gray-800 text-white w-full focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowImagePopup(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const url = imageUrl.trim();
                    if (!url || socketRef.current?.readyState !== WebSocket.OPEN) return;
                    const temp_id = `temp-${Date.now()}`;
                    const msg = {
                      type: "chat",
                      temp_id,
                      sender: USERNAME,
                      receiver: RECEIVER,
                      message: url, // we auto-detect type when rendering
                      status: "sending",
                    };
                    setMessages((prev) => [...prev, msg]);
                    socketRef.current.send(JSON.stringify(msg));
                    setImageUrl("");
                    setShowImagePopup(false);
                    setTimeout(() => scrollToBottom(true), 0);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <p className="text-xs text-gray-400 italic px-4 mb-1">You are typing...</p>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="sticky bottom-4 z-10 my-1 mx-3 rounded-2xl border border-gray-600/50 shadow-xl bg-white/10 backdrop-blur-md p-3 flex flex-col gap-1"
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              style={{ maxHeight: "200px", overflowY: "auto" }}
              className="flex-1 resize-none px-4 py-2 rounded-xl bg-transparent text-white placeholder-white/70 focus:outline-none focus:ring-0"
              rows={1}
              placeholder="Type message or paste a link..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setIsTyping(true);
                const ta = textareaRef.current;
                if (ta) {
                  ta.style.height = "auto";
                  ta.style.height = ta.scrollHeight + "px";
                }
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              type="button"
              onClick={() => setShowImagePopup(true)}
              className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600"
            >
              <ImageIcon className="w-5 h-5 text-white" />
            </button>

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
