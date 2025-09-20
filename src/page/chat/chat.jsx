import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { Send, Undo2, Image as ImageIcon, MoreVertical, Edit3, Trash2, Check, X } from "lucide-react";
import axios from "axios";
import "../../new.css";

import api from "../../utils/api";

import Listuser from "./Listuser";
import { motion, AnimatePresence } from "framer-motion";
import { Clipboard } from "lucide-react"; // Assuming you use lucide-react

import { verifiedUsernames } from "../../verifiedAccounts";
import VerifiedBadge from "../../componet/VerifiedBadge";






const LinkPreview = ({ url, meta }) => {
  // meta from link-preview-js: { title, description, images: [...] }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl overflow-hidden border border-gray-700 bg-gray-800 hover:bg-gray-700 transition max-w-[320px]"
    >
      {meta?.images?.[0] && (
        <img src={meta.images[0]} alt={meta.title || "preview"} className="w-full h-40 object-cover" />
      )}

      <div className="p-2">
        <p className="text-sm font-semibold text-white truncate">{meta?.title || url}</p>
        {meta?.description && <p className="text-xs text-gray-400 line-clamp-2">{meta.description}</p>}
        <p className="text-xs text-emerald-400 mt-1">{new URL(url).hostname}</p>
      </div>
    </a>
  );
};









// helper ext detection
const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "avif"];
const VIDEO_EXT = ["mp4", "webm", "ogg", "mov", "m4v"];
const AUDIO_EXT = ["mp3", "wav", "ogg", "m4a", "aac", "flac"];
const DOC_EXT = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv", "md"];

const getExtFromUrl = (raw) => {
  try {
    const u = new URL(raw);
    const p = u.pathname.split("?")[0].split("#")[0];
    const dot = p.lastIndexOf(".");
    return dot > -1 ? p.slice(dot + 1).toLowerCase() : "";
  } catch {
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
  } catch { return null; }
};

// main renderer (raw: message text; linkMeta: { url: meta }; openLightbox: (url,type) => void)
const renderMedia = (raw, linkMeta = {}, openLightbox) => {
  if (!raw) return null;

  const bubbleMediaWrapper =
    "w-40 h-40 md:w-56 md:h-56 rounded-lg overflow-hidden cursor-pointer";

  try {
    const maybeUrl = new URL(raw);
    const ext = getExtFromUrl(raw);

    // 📷 Image bubble (cropped)
    if (IMAGE_EXT.includes(ext)) {
      return (
        <img
          src={raw}
          alt="image"
          onClick={() => openLightbox({ url: raw, type: "image" })}
          className={`${bubbleMediaWrapper} object-cover hover:opacity-90`}
        />
      );
    }

    if (VIDEO_EXT.includes(ext)) {
      return (
        <video
          controls
          onClick={() => openLightbox({ url: raw, type: "video" })}
          className={`${bubbleMediaWrapper} object-cover hover:opacity-90`}
        >
          <source src={raw} />
        </video>
      );
    }

    // 🎵 Audio
    if (AUDIO_EXT.includes(ext)) {
      return (
        <audio controls className="w-56">
          <source src={raw} />
        </audio>
      );
    }

    // 📄 Document
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

    // 🔗 Links (rich preview or fallback)
    const meta = linkMeta[maybeUrl.href];
    if (meta) {
      return <LinkPreview url={maybeUrl.href} meta={meta} />;
    }

    return (
      <a
        href={raw}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-blue-400 break-words break-all"
      >
        {maybeUrl.href}
      </a>
    );
  } catch {
    return <p>{raw}</p>;
  }
};





function LightboxModal({ openData, onClose }) {
  return (
    <AnimatePresence>
      {openData?.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="relative z-10 max-w-[90vw] max-h-[90vh]"
          >
            <div className="rounded-lg overflow-hidden bg-black">
              {openData.type === "image" && (
                <img
                  src={openData.url}
                  alt="preview"
                  className="max-w-[90vw] max-h-[90vh] object-contain"
                />
              )}
              {openData.type === "video" && (
                <video controls className="max-w-[90vw] max-h-[90vh]">
                  <source src={openData.url} />
                </video>
              )}
            </div>
            <button
              className="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white"
              onClick={onClose}
            >
              ✕
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}




export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [ownProfile, setOwnProfile] = useState(null);
  const [receiverProfile, setReceiverProfile] = useState(null);





  const [linkMeta, setLinkMeta] = useState({});
  const loadingRef = useRef(new Set()); // track which urls are being fetched
  const [lightbox, setLightbox] = useState({ url: null, type: null });

  // popup for image/url
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [imageUrl, setImageUrl] = useState("");


  const [lightboxData, setLightboxData] = useState(null);

  // typing
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // sockets + scroll
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const listRef = useRef(null);
  const textareaRef = useRef(null);

  const { RECEIVER } = useParams();
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



  const [USERNAME, setUSERNAME] = useState(null);




  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [showMessageMenu, setShowMessageMenu] = useState(null);

  const handleEditMessage = async (messageId, newContent) => {
    try {
      const response = await api.put(
        `chatting/${messageId}/edit/`,
        { content: newContent },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': Cookies.get('csrftoken')
          }
        }
      );

      if (response.data && response.data.id) {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, message: newContent, is_edited: true }
            : msg
        ));
        setEditingMessage(null);
        setEditText("");
        return true;
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
      console.error('Response data:', error.response?.data);

      // If PUT fails, try POST as fallback
      try {
        const postResponse = await api.post(
          `chatting/${messageId}/edit/`,
          { content: newContent },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': Cookies.get('csrftoken')
            }
          }
        );

        if (postResponse.data && postResponse.data.id) {
          setMessages(prev => prev.map(msg =>
            msg.id === messageId
              ? { ...msg, message: newContent, is_edited: true }
              : msg
          ));
          setEditingMessage(null);
          setEditText("");
          return true;
        }
      } catch (postError) {
        console.error('POST fallback also failed:', postError);
        alert('Failed to edit message. Check console for details.');
      }
    }
    return false;
  };


  // Delete message function
  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await api.delete(`chatting/${messageId}/delete/`, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken')
        }
      });

      if (response.data.success) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        setShowMessageMenu(null);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      console.error('Response data:', error.response?.data);
      alert('Failed to delete message. Check console for details.');
    }
  };


  // Start editing
  const startEditing = (msg) => {
    setEditingMessage(msg.id);
    setEditText(msg.message);
    setShowMessageMenu(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMessage(null);
    setEditText("");
  };

  // Save edit
  const saveEdit = () => {
    if (editText.trim() && editText.trim() !== messages.find(m => m.id === editingMessage)?.message) {
      handleEditMessage(editingMessage, editText.trim());
    } else {
      cancelEditing();
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMessageMenu) setShowMessageMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMessageMenu]);


  // Receiver profile (from URL param)
  useEffect(() => {
    if (!RECEIVER) return;

    const fetchProfile = async () => {
      try {
        console.warn(RECEIVER)
        const res = await api.post(`/Profile/details/?username=${RECEIVER}`);
        setReceiverProfile(res.data);
        console.warn(res.data)
      } catch (err) {
        console.warn("[Profile GET failed, trying POST fallback]", err);

      }
    };

    fetchProfile();
  }, [RECEIVER]);

  // ---------- WebSocket + history ----------
  useEffect(() => {
    if (!RECEIVER) return;

    let socket;

    const initWebSocket = async () => {
      try {
        // Step 0: fetch logged-in user
        const meRes = await api.get("/me/", { withCredentials: true });
        if (!meRes.data?.username) {
          console.error("❌ Failed to fetch logged-in user");
          return;
        }
        const currentUsername = meRes.data.username;
        setUSERNAME(currentUsername); // Make sure to set this

        // Fetch own profile details
        try {
          const details = await api.post(`/Profile/details`);
          setOwnProfile(details.data);
        } catch (err) {
          console.warn("⚠️ Failed to fetch own profile details", err);
        }

        // Fetch receiver profile details
        try {
          const receiverDetails = await api.post(`/Profile/details/`, {
            username: RECEIVER, // Use targetUser instead of userToFetch
          });
          setReceiverProfile(receiverDetails.data);
        } catch (err) {
          console.warn("⚠️ Failed to fetch receiver profile details", err);
        }

        // Step 1: request short-lived ws_token
        const res = await api.get("/ws-token/", { withCredentials: true });
        const wsToken = res.data.ws_token;

        if (!wsToken) {
          console.error("❌ Failed to get WS token");
          return;
        }

        // Step 2: build WebSocket URL
        const wsUrl = `wss://pixel-classes.onrender.com/ws/chat/?token=${wsToken}&receiver=${RECEIVER}`;
        socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        console.log("🌐 Connecting to:", wsUrl);

        socket.onopen = async () => {
          console.log("✅ Connected to chat WebSocket:", wsUrl);

          try {
            // Fetch chat history via REST
            const res = await api.get(`chatting/${RECEIVER}/`, {
              withCredentials: true,
            });

            const data = res.data;
            if (Array.isArray(data)) {
              const hist = data
                .map((msg) => ({
                  id: msg.id,
                  sender: msg.sender,
                  receiver: msg.receiver, // Make sure this is included
                  message: msg.content,
                  seen: msg.seen_at,
                  status: msg.is_seen ? "seen" : "sent",
                  created_at: msg.created_at
                }))
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

              setMessages(hist);
              setTimeout(() => scrollToBottom(true), 0);
            }
          } catch (e) {
            console.error("history load failed", e);
          }
        };

        socket.onmessage = (e) => {
          const data = JSON.parse(e.data);
          console.log("📨 Received WebSocket message:", data);

          if (data.type === "seen") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === data.message_id
                  ? { ...m, status: "seen", seen: new Date().toISOString() }
                  : m
              )
            );
            return;
          }

          if (data.type === "chat") {
            setMessages((prev) => {
              // First, try to find and update existing temporary message
              const tempIndex = prev.findIndex(m =>
                data.temp_id && m.temp_id === data.temp_id && m.status === "sending"
              );

              if (tempIndex !== -1) {
                // Update the temporary message with real data
                const updated = [...prev];
                updated[tempIndex] = {
                  ...updated[tempIndex],
                  id: data.id,
                  status: "sent",
                  created_at: data.created_at
                };
                return updated;
              }

              // If no temporary message found, check if this is a duplicate
              const existingMessage = prev.find(m =>
                m.id === data.id ||
                (m.sender === data.sender &&
                  m.message === data.message &&
                  Math.abs(new Date(m.created_at || Date.now()) - new Date(data.created_at)) < 1000)
              );

              if (existingMessage) {
                // Message already exists, don't add duplicate
                return prev;
              }

              // Add new message
              const newMessage = {
                id: data.id,
                sender: data.sender,
                receiver: data.receiver,
                message: data.message,
                status: "sent",
                created_at: data.created_at
              };

              return [...prev, newMessage].sort((a, b) =>
                new Date(a.created_at || Date.now()) - new Date(b.created_at || Date.now())
              );
            });

            setTimeout(() => scrollToBottom(), 0);
          }

          if (data.type === "error") {
            console.error("❌ WebSocket error:", data.message);
          }
        };

        socket.onclose = () => {
          console.log("❌ Disconnected from chat WebSocket");
        };

        socket.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
        };

      } catch (err) {
        console.error("❌ Failed to init WebSocket:", err);
      }
    };

    initWebSocket();

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [RECEIVER]);

  // Updated sendMessage function
  const sendMessage = (messageText = null) => {
    const messageContent = messageText || input.trim();

    if (!messageContent || socketRef.current?.readyState !== WebSocket.OPEN || !USERNAME) {
      return;
    }

    const temp_id = `temp-${Date.now()}-${Math.random()}`;

    // Add temporary message to UI immediately
    const tempMessage = {
      temp_id,
      sender: USERNAME,
      receiver: RECEIVER,
      message: messageContent,
      status: "sending",
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, tempMessage]);

    // Send message via WebSocket
    const wsMessage = {
      type: "chat",
      temp_id,
      sender: USERNAME,
      receiver: RECEIVER,
      message: messageContent,
    };

    socketRef.current.send(JSON.stringify(wsMessage));

    // Clear input only if sending from input field
    if (!messageText) {
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    // 3. THE FIX: Re-focus the textarea to keep the keyboard open
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    }

    setTimeout(() => scrollToBottom(true), 0);
  };

  // Updated sendSeenStatus function
  const sendSeenStatus = (messageId) => {
    if (socketRef.current?.readyState === WebSocket.OPEN && USERNAME) {
      socketRef.current.send(
        JSON.stringify({
          type: "seen",
          message_id: messageId,
          seen_by: USERNAME
        })
      );
    }
  };



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

  useEffect(() => {
    messages.forEach((m) => {
      try {
        const u = new URL(m.message);
        const href = u.href;
        if (!linkMeta[href] && !loadingRef.current.has(href)) {
          loadingRef.current.add(href);
          axios.get(`/api/preview?url=${encodeURIComponent(href)}`)
            .then(res => setLinkMeta(prev => ({ ...prev, [href]: res.data })))
            .catch(err => setLinkMeta(prev => ({ ...prev, [href]: null })))
            .finally(() => {
              loadingRef.current.delete(href);
            });
        }
      } catch (err) { /* not a URL, ignore */ }
    });
  }, [messages]);
  const openLightbox = (data) => setLightboxData(data); // data = { url, type }
  const closeLightbox = () => setLightboxData(null);



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

  // console.log(receiverProfile)







  return (
    <div className="flex h-screen ccf bg-gray-900">
      {/* Left panel */}
      <div className="resize-x min-w-[269px]  max-w-[469px] overflow-y-auto border-r border-gray-700 hidden lg:block">

        <Listuser />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col text-white">
        {/* Header */}
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 overflow-hidden flex items-center gap-3 px-4 py-3 border-b border-gray-700">
          <button onClick={() => navigate("/chat")} className="p-2">
            <Undo2 className="text-white" />
          </button>

          <img
            onClick={() => navigate(`/profile/${receiverProfile?.username || RECEIVER}`)}
            src={
              receiverProfile?.profile_pic ||
              "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png"
            }
            className="w-8 h-8 rounded-full"
          />

          <div
            onClick={() => navigate(`/profile/${receiverProfile?.username || RECEIVER}`)}
            className="flex flex-col"
          >
            <span className="font-semibold flex items-center gap-1">
              {receiverProfile?.username || RECEIVER}
              {verifiedUsernames.has(receiverProfile?.username || RECEIVER) && (
                <VerifiedBadge size={24} />
              )}
            </span>
            <span className="text-xs text-gray-400">
              {receiverProfile?.last_seen
                ? `last seen ${receiverProfile.last_seen}`
                : "last seen recently"}
            </span>
          </div>
        </div>



        {/* Messages */}
        <div
          ref={listRef}
          className="flex flex-1 flex-col overflow-y-auto px-4 py-4 space-y-1"
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

            const isEditing = editingMessage === msg.id;

            return (
              <div key={`${msg.id ?? "temp"}-${i}`} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} `}>
                <div
                  id={msg.id ? `msg-${msg.id}` : undefined}
                  className={`group relative w-fit max-w-[75%] h-fit overflow-x-auto shadow-md whitespace-pre-wrap break-words text-sm md:text-base ${bubbleClasses} ${isOwn ? "ml-auto bg-emerald-500/30 text-white flex-end" : "mr-auto bg-gray-200/10 text-white"
                    }`}
                >
                  {/* Message Content */}
                  <div className="px-4 py-3">
                    {isEditing ? (
                      // Edit mode
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-transparent border border-gray-500 rounded px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 resize-none"
                          rows={Math.max(1, editText.split('\n').length)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              saveEdit();
                            } else if (e.key === 'Escape') {
                              cancelEditing();
                            }
                          }}
                        />
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={cancelEditing}
                            className="p-1 rounded hover:bg-gray-600 text-gray-300 hover:text-white"
                          >
                            <X size={16} />
                          </button>
                          <button
                            onClick={saveEdit}
                            className="p-1 rounded hover:bg-emerald-600 text-emerald-400 hover:text-white"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Normal message display
                      <div>
                        {renderMedia(msg.message, linkMeta, openLightbox)}
                        {msg.is_edited && (
                          <span className="text-xs text-gray-400 ml-2">(edited)</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Options Menu (only for own messages) */}
                  {isOwn && !isEditing && msg.id && !String(msg.id).startsWith("temp-") && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMessageMenu(showMessageMenu === msg.id ? null : msg.id);
                        }}
                        className="p-1 rounded-full hover:bg-black/20 text-gray-300 hover:text-white"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Dropdown Menu */}
                {showMessageMenu === msg.id && (
                  <div
                    className="block right-2 top-8  m-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 z-10 max-w-64 min-w-[120px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => startEditing(msg)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteMessage(msg.id);
                        setShowMessageMenu(null);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}

                {/* Avatar and status info */}
                {!isOwn && isLastOfGroup && (
                  <div className="flex items-center left-0 gap-1 mt-1">
                    <img
                      src={receiverProfile?.profile_pic || "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png"}
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



        <LightboxModal openData={lightboxData} onClose={closeLightbox} />



        {/* Typing indicator */}
        {isTyping && (
          <p className="text-xs text-neutral-400 italic px-4 mb-1">
            typing...
          </p>
        )}

        {/* --- NEW FADE & INPUT FORM STRUCTURE --- */}
        <div className="sticky -bottom-2 z-10 w-full p-4">
          {/* (1) The FADE GRADIENT */}
          {/* This div creates the fade effect above the input bar. */}
          <div className="absolute bottom-full left-0 h-14 w-full bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent pointer-events-none" />

          {/* (2) The ENHANCED GLASSMORPHISM FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // sendMessage();
            }}
            // --- ENHANCED GLASSMORPHISM CLASSES ---
            className="relative flex items-end gap-2 rounded-3xl border border-white/20 bg-gray-900/30 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-300 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/30"
          >
            <textarea
              ref={textareaRef}
              style={{ maxHeight: "200px", overflowY: "auto" }}
              className="flex-1 resize-none bg-transparent px-3 py-2 text-base text-neutral-100 placeholder-neutral-400 transition-colors duration-200 focus:outline-none"
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

            <button
              type="button"
              // onClick={() => setShowImagePopup(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              {/* Replace with your ImageIcon component */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
            </button>

            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:shadow-none"
            // disabled={!input.trim()}
            >
              {/* Replace with your Send component */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
