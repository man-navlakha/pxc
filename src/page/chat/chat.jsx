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
import { Button } from "../../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";


import LightboxModal from "./LightboxModal";

import Clock from '../../componet/svg/Clock'
import Check2 from '../../componet/svg/Check2'
import TrimSend from "@/componet/svg/TrimSend";
import Photo from "@/componet/svg/Photo";
import MediaRenderer from "./MediaRenderer";
import { handleDeleteMessage, handleEditMessage } from "./messageActions";





export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [ownProfile, setOwnProfile] = useState(null);
  const [receiverProfile, setReceiverProfile] = useState(null);
  const [linkMeta, setLinkMeta] = useState({});
  const loadingRef = useRef(new Set()); // track which urls are being fetched
  // popup for image/url
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [lightboxData, setLightboxData] = useState(null);
  const typingTimeoutRef = useRef(null);
  // sockets + scroll
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const listRef = useRef(null);
  const textareaRef = useRef(null);
  const { RECEIVER } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [USERNAME, setUSERNAME] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [showMessageMenu, setShowMessageMenu] = useState(null);



  useEffect(() => {
    setMessages([]);
  }, [RECEIVER]);

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
    if (
      editText.trim() &&
      editText.trim() !== messages.find((m) => m.id === editingMessage)?.message
    ) {
      handleEditMessage(
        editingMessage,
        editText.trim(),
        setMessages,
        setEditingMessage,
        setEditText
      );
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
  return (
    <div className="flex h-screen ccf bg-gray-900">
      {/* Left panel */}
      <div className="resize-x min-w-[269px]  max-w-[469px] overflow-y-auto border-r border-gray-700 hidden lg:block">

        <Listuser />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col text-white">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 overflow-hidden flex items-center gap-3 px-4 py-3 border-b border-gray-700">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/chat")}
            className="p-2 hover:bg-gray-800"
          >
            <Undo2 className="text-white" />
          </Button>

          <Avatar
            className="w-8 h-8 cursor-pointer border border-gray-600"
            onClick={() => navigate(`/profile/${receiverProfile?.username || RECEIVER}`)}
          >
            <AvatarImage
              src={
                receiverProfile?.profile_pic ||
                "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png"
              }
            />
            <AvatarFallback className="bg-gray-700 text-white">
              {receiverProfile?.username?.[0] || RECEIVER?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          <div
            onClick={() => navigate(`/profile/${receiverProfile?.username || RECEIVER}`)}
            className="flex flex-col cursor-pointer"
          >
            <span className="font-semibold flex items-center gap-1 text-white">
              {receiverProfile?.username || RECEIVER}
              {verifiedUsernames.has(receiverProfile?.username || RECEIVER) && (
                <VerifiedBadge size={16} />
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
                        <MediaRenderer
                          raw={msg.message}
                          linkMeta={linkMeta}
                          openLightbox={openLightbox}
                        />
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
                        handleDeleteMessage(msg.id, setMessages, setShowMessageMenu);
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
                    {msg.status === "seen" && msg.seen ? <div className="flex gap-1 items-center"><Check2 /> Seen ${msg.seen}</div> : <div className="flex gap-1 items-center"><Clock /> Sent</div>}
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

        <div className="sticky bottom-0 z-10 w-full p-4">
          <div className="absolute bottom-8 left-0 h-32 w-full bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="relative flex items-end gap-2 rounded-xl border border-white/20 bg-gray-900/30 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-300 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/30"
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
                const ta = e.target;
                ta.style.height = "auto";
                ta.style.height = `${ta.scrollHeight}px`;
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              <Photo />
            </button>
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:shadow-none"
              disabled={!input.trim()}
            >
              <TrimSend />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}