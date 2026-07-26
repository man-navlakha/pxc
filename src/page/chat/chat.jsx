import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowUp,
  Check,
  Clipboard,
  Clock3,
  Edit3,
  Info,
  MessageCircle,
  MoreVertical,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import axios from "axios";

import api from "../../utils/api";

import Listuser from "./Listuser";
import { motion, AnimatePresence } from "framer-motion";
import { verifiedUsernames } from "../../verifiedAccounts";
import VerifiedBadge from "../../componet/VerifiedBadge";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";


import LightboxModal from "./LightboxModal";

import Clock from '../../componet/svg/Clock'
import Check2 from '../../componet/svg/Check2'
import Photo from "@/componet/svg/Photo";
import MediaRenderer from "./MediaRenderer";
import { handleDeleteMessage, handleEditMessage } from "./messageActions";
import { buildWebSocketUrl, shouldAttemptWebSocket } from "../../utils/ws";

const PIXEL_SUPPORT_PROFILE = {
  username: "pixel",
  display_name: "Pixel Help Buddy",
  profile_pic: "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png",
  last_seen: "support is online",
};

const cx = (...classes) => classes.filter(Boolean).join(" ");

const getProfileInitial = (profile, fallback) =>
  (profile?.display_name || profile?.username || fallback || "U").trim()[0]?.toUpperCase() || "U";


const desktopChatSidebarClass =
  "chat-resize-rail hidden w-[clamp(20rem,30vw,29rem)] min-w-[18rem] max-w-[34rem] resize-x overflow-hidden border-r border-white/[0.14] bg-[#4b4644] lg:flex";

const responsiveChatSidebarClass =
  "chat-resize-rail flex min-w-0 flex-1 overflow-hidden bg-[#4b4644] lg:w-[clamp(20rem,30vw,29rem)] lg:min-w-[18rem] lg:max-w-[34rem] lg:flex-none lg:resize-x lg:border-r lg:border-white/[0.14]";

function ChatShell({ children, sidebarClassName = desktopChatSidebarClass }) {
  return (
    <div className="chat-dm-stage chat-font flex min-h-[100dvh] w-full bg-[#141414] text-zinc-50">
      <div className="chat-dm-frame flex h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-[#151515]">
        <aside className={sidebarClassName}>
          <Listuser embedded />
        </aside>
        {children}
      </div>
    </div>
  );
}

export function ChatHome() {
  return (
    <ChatShell sidebarClassName={responsiveChatSidebarClass}>
      <main className="hidden min-w-0 flex-1 flex-col overflow-hidden bg-[#141414] lg:flex">
        <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-white/10 bg-[#222222]/92 px-5 backdrop-blur-xl">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-zinc-300">
            <MessageCircle size={19} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-semibold leading-5 text-white">
              Messages
            </h1>
            <p className="mt-1 truncate text-xs font-medium text-zinc-400">
              No conversation selected
            </p>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-8 text-center">
          <div className="max-w-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/[0.12] bg-white/[0.06] text-zinc-200 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
              <MessageCircle size={32} />
            </div>
            <h2 className="text-xl font-semibold text-white">
              No chat selected
            </h2>
          </div>
        </div>
      </main>
    </ChatShell>
  );
}

const chatSkeletonRows = [
  ["start", "w-24"],
  ["start", "w-52"],
  ["end", "w-32"],
  ["start", "w-64"],
  ["end", "w-44"],
  ["start", "w-36"],
];

const normalizeChatMessage = (msg) => ({
  id: msg.id,
  sender: msg.sender,
  receiver: msg.receiver,
  message: msg.content ?? msg.message,
  seen: msg.seen_at,
  status: msg.is_seen ? "seen" : "sent",
  created_at: msg.created_at,
  is_edited: msg.is_edited,
});

function ChatMessageSkeleton() {
  return (
    <div
      className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-end gap-4 py-4"
      role="status"
      aria-label="Loading messages"
    >
      {chatSkeletonRows.map(([align, width], index) => (
        <div
          key={`${align}-${width}-${index}`}
          className={cx("flex w-full", align === "end" ? "justify-end" : "justify-start")}
        >
          <div
            className={cx(
              "h-11 max-w-[74%] animate-pulse rounded-[22px] bg-white/[0.08]",
              align === "end" ? "bg-[#3b82f6]/30" : "bg-white/[0.08]",
              width
            )}
            style={{ animationDelay: `${index * 90}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [, setOwnProfile] = useState(null);
  const [receiverProfile, setReceiverProfile] = useState(null);
  const [linkMeta, setLinkMeta] = useState({});
  const loadingRef = useRef(new Set()); // track which urls are being fetched
  // popup for image/url
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [lightboxData, setLightboxData] = useState(null);
  // sockets + scroll
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const listRef = useRef(null);
  const textareaRef = useRef(null);
  const autoSendRef = useRef("");
  const { RECEIVER } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [USERNAME, setUSERNAME] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [socketReady, setSocketReady] = useState(false);
  const [restFallback, setRestFallback] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const supportUser = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("supportUser") || params.get("support_user") || "";
  }, [location.search]);
  const isPixelSupportChat = String(RECEIVER || "").toLowerCase() === "pixel";
  const receiverDisplayName =
    receiverProfile?.display_name || receiverProfile?.username || RECEIVER;
  const chatReady = socketReady || restFallback;



  useEffect(() => {
    setMessages([]);
    setChatLoading(true);
    setRestFallback(false);
  }, [RECEIVER, supportUser]);

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

    if (isPixelSupportChat) {
      setReceiverProfile(PIXEL_SUPPORT_PROFILE);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.post(`/Profile/details/?username=${RECEIVER}`);
        setReceiverProfile(res.data);
      } catch (err) {
        console.warn("[Profile GET failed, trying POST fallback]", err);

      }
    };

    fetchProfile();
  }, [RECEIVER, isPixelSupportChat]);

  // ---------- WebSocket + history ----------
  useEffect(() => {
    if (!RECEIVER) return;

    let socket;
    let cancelled = false;
    let historyLoaded = false;
    const finishChatLoading = () => {
      if (!cancelled) setChatLoading(false);
    };

    const loadChatHistory = async () => {
      if (historyLoaded) {
        finishChatLoading();
        return;
      }

      historyLoaded = true;

      try {
        const res = await api.get(`chatting/${RECEIVER}/`, {
          withCredentials: true,
          params: isPixelSupportChat && supportUser
            ? { support_user: supportUser }
            : undefined,
        });

        const data = res.data;
        if (Array.isArray(data)) {
          const hist = data
            .map(normalizeChatMessage)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

          if (!cancelled) setMessages(hist);
          setTimeout(() => scrollToBottom(true), 0);
        }
      } catch (e) {
        console.error("history load failed", e);
      } finally {
        finishChatLoading();
      }
    };

    const enableRestFallback = async () => {
      if (cancelled) return;
      setRestFallback(true);
      setSocketReady(false);
      await loadChatHistory();
    };

    setRestFallback(false);
    setSocketReady(false);
    setChatLoading(true);

    const initWebSocket = async () => {
      try {
        // Step 0: fetch logged-in user
        const meRes = await api.get("/me/", { withCredentials: true });
        if (cancelled) return;
        if (!meRes.data?.username) {
          console.error("❌ Failed to fetch logged-in user");
          finishChatLoading();
          return;
        }
        const currentUsername = meRes.data.username;
        setUSERNAME(currentUsername); // Make sure to set this

        // Fetch own profile details
        try {
          const details = await api.post(`/Profile/details`, {username: undefined});
          setOwnProfile(details.data);
        } catch (err) {
          console.warn("⚠️ Failed to fetch own profile details", err);
        }

        if (isPixelSupportChat) {
          setReceiverProfile(PIXEL_SUPPORT_PROFILE);
        } else {
          // Fetch receiver profile details
          try {
            const receiverDetails = await api.post(`/Profile/details/`, {
              username: RECEIVER,
            });
            setReceiverProfile(receiverDetails.data);
          } catch (err) {
            console.warn("⚠️ Failed to fetch receiver profile details", err);
          }
        }

        if (!shouldAttemptWebSocket()) {
          console.warn("Chat WebSocket skipped. Configure NEXT_PUBLIC_WS_URL for live chat in production.");
          await enableRestFallback();
          return;
        }

        // Step 1: request short-lived ws_token
        const res = await api.get("/ws-token/", { withCredentials: true });
        if (cancelled) return;
        const wsToken = res.data.ws_token;

        if (!wsToken) {
          console.error("❌ Failed to get WS token");
          await enableRestFallback();
          return;
        }

        // Step 2: build WebSocket URL
        const wsUrl = buildWebSocketUrl("/ws/chat");
        wsUrl.searchParams.set("token", wsToken);
        wsUrl.searchParams.set("receiver", RECEIVER);
        if (isPixelSupportChat && supportUser) {
          wsUrl.searchParams.set("support_user", supportUser);
        }

        socket = new WebSocket(wsUrl.toString());
        socketRef.current = socket;

        console.log("🌐 Connecting to chat WebSocket");

        socket.onopen = async () => {
          if (cancelled) return;
          console.log("✅ Connected to chat WebSocket");
          setRestFallback(false);
          await loadChatHistory();
        };

        socket.onmessage = (e) => {
          if (cancelled) return;
          const data = JSON.parse(e.data);
          console.log("📨 Received WebSocket message:", data);

          if (data.type === "ready") {
            setSocketReady(true);
            setRestFallback(false);
            return;
          }

          if (data.type === "connecting") {
            return;
          }

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
          if (cancelled) return;
          console.log("❌ Disconnected from chat WebSocket");
          enableRestFallback();
        };

        socket.onerror = (error) => {
          if (cancelled) return;
          console.error("❌ WebSocket error:", error);
          enableRestFallback();
        };

      } catch (err) {
        console.error("❌ Failed to init WebSocket:", err);
        await enableRestFallback();
      }
    };

    initWebSocket();

    return () => {
      cancelled = true;
      setSocketReady(false);
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [RECEIVER, supportUser, isPixelSupportChat]);

  // Updated sendMessage function
  const sendMessage = async (messageText = null) => {
    const messageContent = messageText || input.trim();
    const canUseSocket =
      socketRef.current?.readyState === WebSocket.OPEN && socketReady && !restFallback;

    if (!messageContent || !USERNAME || (!canUseSocket && !restFallback)) {
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

    // Clear input only if sending from input field
    if (!messageText) {
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }

    setTimeout(() => scrollToBottom(true), 0);

    const wsMessage = {
      type: "chat",
      temp_id,
      sender: USERNAME,
      receiver: RECEIVER,
      support_user: isPixelSupportChat ? supportUser : undefined,
      message: messageContent,
    };

    if (canUseSocket) {
      socketRef.current.send(JSON.stringify(wsMessage));
    } else {
      try {
        const res = await api.post(
          `chatting/${RECEIVER}/`,
          {
            content: messageContent,
            support_user: isPixelSupportChat ? supportUser : undefined,
          },
          { withCredentials: true }
        );
        const savedMessage = normalizeChatMessage(res.data);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.temp_id === temp_id ? { ...savedMessage, status: "sent" } : msg
          )
        );
      } catch (err) {
        console.error("REST chat send failed", err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.temp_id === temp_id ? { ...msg, status: "failed" } : msg
          )
        );
      }
    }
  };

  // Updated sendSeenStatus function
  const sendSeenStatus = (messageId) => {
    if (socketRef.current?.readyState === WebSocket.OPEN && USERNAME) {
      socketRef.current.send(
        JSON.stringify({
          type: "seen",
          message_id: messageId,
          seen_by: USERNAME,
          support_user: isPixelSupportChat ? supportUser : undefined,
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
            m.sender !== USERNAME &&
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
  }, [messages, RECEIVER, USERNAME, isPixelSupportChat, supportUser]);

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
    if (!url || !chatReady) return;

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
    if (!prefill) return;

    const decodedPrefill = decodeURIComponent(prefill);
    const shouldAutoSend = params.get("autoSend") === "1";
    const autoSendKey = `${RECEIVER || ""}:${supportUser}:${decodedPrefill}`;

    setInput(decodedPrefill);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }

    if (!shouldAutoSend || !chatReady || chatLoading || autoSendRef.current === autoSendKey) {
      return;
    }

    autoSendRef.current = autoSendKey;
    sendMessage(decodedPrefill);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    params.delete("prefillMessage");
    params.delete("autoSend");
    params.delete("source");
    const nextSearch = params.toString();
    navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ""}`, { replace: true });
  }, [RECEIVER, chatLoading, chatReady, location.pathname, location.search, navigate, supportUser]);

  const receiverInitial = getProfileInitial(receiverProfile, RECEIVER);
  const statusLabel = isPixelSupportChat
    ? supportUser
      ? `Support thread for ${supportUser}`
      : "Project help and custom work"
    : receiverProfile?.last_seen
    ? `Last seen ${receiverProfile.last_seen}`
    : "Last seen recently";
  const canOpenReceiverProfile = !isPixelSupportChat;
  const openReceiverProfile = () => {
    if (canOpenReceiverProfile) {
      navigate(`/profile/${receiverProfile?.username || RECEIVER}`);
    }
  };
  const connectionLabel = socketReady
    ? "Connected"
    : restFallback
    ? "Connected without live updates"
    : "Connecting";
  const showChatSkeleton = messages.length === 0 && chatLoading;

  return (
    <ChatShell>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#141414]">
        <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-white/10 bg-[#222222]/92 px-3 backdrop-blur-xl sm:px-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/chat")}
            aria-label="Back to inbox"
            className="h-10 w-10 shrink-0 rounded-2xl text-zinc-300 hover:bg-white/[0.08] hover:text-white lg:hidden"
          >
            <Undo2 size={18} />
          </Button>

          <Avatar
            className={cx(
              "h-12 w-12 shrink-0 border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.24)]",
              canOpenReceiverProfile && "cursor-pointer"
            )}
            onClick={openReceiverProfile}
          >
            <AvatarImage
              src={
                receiverProfile?.profile_pic ||
                "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png"
              }
              alt={receiverDisplayName}
            />
            <AvatarFallback className="bg-[#3b82f6]/20 text-sm font-semibold text-blue-100">
              {receiverInitial}
            </AvatarFallback>
          </Avatar>

          <button
            type="button"
            onClick={openReceiverProfile}
            disabled={!canOpenReceiverProfile}
            className={cx(
              "min-w-0 flex-1 text-left",
              canOpenReceiverProfile ? "cursor-pointer" : "cursor-default"
            )}
          >
            <span className="flex min-w-0 items-center gap-2 text-[17px] font-semibold leading-5 text-white">
              <span className="truncate">{receiverDisplayName}</span>
              {!isPixelSupportChat &&
                verifiedUsernames.has(receiverProfile?.username || RECEIVER) && (
                  <VerifiedBadge size={16} />
                )}
            </span>
            <span className="mt-1 block truncate text-xs font-medium text-zinc-400">
              {statusLabel}
            </span>
          </button>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <span
              title={connectionLabel}
              className={cx(
                "hidden h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 md:flex",
                chatReady ? "text-blue-300" : "text-zinc-400"
              )}
            >
              {chatReady ? <Check size={19} /> : <Clock3 size={19} />}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={openReceiverProfile}
              disabled={!canOpenReceiverProfile}
              aria-label="View profile"
              className="h-10 w-10 rounded-2xl text-zinc-300 hover:bg-white/[0.08] hover:text-white disabled:cursor-default disabled:opacity-40"
            >
              <Info size={19} />
            </Button>
          </div>
        </header>

        <div
          ref={listRef}
          className="chat-scrollbar flex flex-1 flex-col overflow-y-auto bg-[#141414] px-4 py-6 sm:px-7 lg:px-8"
        >
          {showChatSkeleton ? (
            <ChatMessageSkeleton />
          ) : messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-4 py-12">
              <div className="max-w-sm text-center">
                <Avatar className="mx-auto mb-5 h-20 w-20 border border-white/[0.18] shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
                  <AvatarImage
                    src={
                      receiverProfile?.profile_pic ||
                      "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png"
                    }
                    alt={receiverDisplayName}
                  />
                  <AvatarFallback className="bg-[#3b82f6]/20 text-xl font-semibold text-blue-100">
                    {receiverInitial}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold text-white">
                  {`Message ${receiverDisplayName}`}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Start with a message or share media in this conversation.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-auto flex w-full max-w-5xl flex-col gap-1.5">
              {messages.map((msg, i) => {
                const isOwn = msg.sender === USERNAME;
                const prevMsg = messages[i - 1];
                const nextMsg = messages[i + 1];
                const isFirstOfGroup = !prevMsg || prevMsg.sender !== msg.sender;
                const isLastOfGroup = !nextMsg || nextMsg.sender !== msg.sender;
                const isEditing = editingMessage === msg.id;

                let bubbleShape = "rounded-[22px]";
                if (isOwn) {
                  if (isFirstOfGroup && !isLastOfGroup) bubbleShape = "rounded-[22px] rounded-br-md";
                  else if (!isFirstOfGroup && !isLastOfGroup) bubbleShape = "rounded-[22px] rounded-r-md";
                  else if (!isFirstOfGroup && isLastOfGroup) bubbleShape = "rounded-[22px] rounded-tr-md";
                } else {
                  if (isFirstOfGroup && !isLastOfGroup) bubbleShape = "rounded-[22px] rounded-bl-md";
                  else if (!isFirstOfGroup && !isLastOfGroup) bubbleShape = "rounded-[22px] rounded-l-md";
                  else if (!isFirstOfGroup && isLastOfGroup) bubbleShape = "rounded-[22px] rounded-tl-md";
                }

                return (
                  <div
                    key={`${msg.id ?? msg.temp_id ?? "temp"}-${i}`}
                    className={cx("flex w-full flex-col", isOwn ? "items-end" : "items-start")}
                  >
                    <div className={cx("flex max-w-[min(78%,42rem)] flex-col", isOwn ? "items-end" : "items-start")}>
                      <div
                        id={msg.id ? `msg-${msg.id}` : undefined}
                        className={cx(
                          "group relative w-fit max-w-full overflow-visible px-4 py-2.5 text-[15px] leading-6 transition",
                          "whitespace-pre-wrap break-words",
                          bubbleShape,
                          isOwn
                            ? "bg-[#3b82f6] text-white shadow-[0_8px_24px_rgba(59,130,246,0.18)]"
                            : "bg-[#2b2b2b] text-zinc-100"
                        )}
                      >
                        {isEditing ? (
                          <div className="flex min-w-[14rem] flex-col gap-3">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="min-h-11 w-full resize-none rounded-2xl border border-white/[0.12] bg-black/25 px-3 py-2 text-sm text-white placeholder-zinc-400 outline-none transition focus:border-blue-300/60 focus:ring-2 focus:ring-blue-300/20"
                              rows={Math.max(1, editText.split("\n").length)}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  saveEdit();
                                } else if (e.key === "Escape") {
                                  cancelEditing();
                                }
                              }}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEditing}
                                aria-label="Cancel edit"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-zinc-100 transition hover:bg-white/15"
                              >
                                <X size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={saveEdit}
                                aria-label="Save edit"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82f6] text-white transition hover:bg-[#2f78ed]"
                              >
                                <Check size={15} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="min-w-0">
                            <MediaRenderer
                              raw={msg.message}
                              linkMeta={linkMeta}
                              openLightbox={openLightbox}
                            />
                            {msg.is_edited && (
                              <span className={cx("ml-2 text-xs", isOwn ? "text-blue-100" : "text-zinc-400")}>
                                Edited
                              </span>
                            )}
                          </div>
                        )}

                        {isOwn && !isEditing && msg.id && !String(msg.id).startsWith("temp-") && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMessageMenu(showMessageMenu === msg.id ? null : msg.id);
                            }}
                            aria-label="Message options"
                            className="absolute -right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#2a2a2a] text-zinc-300 opacity-0 shadow-lg shadow-black/30 transition hover:bg-[#333333] hover:text-white group-hover:opacity-100 focus:opacity-100"
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {showMessageMenu === msg.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.16 }}
                            className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#242424] p-1 shadow-2xl shadow-black/35"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => startEditing(msg)}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-100 transition hover:bg-white/[0.08]"
                            >
                              <Edit3 size={14} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleDeleteMessage(msg.id, setMessages, setShowMessageMenu);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-300 transition hover:bg-red-400/10"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {isOwn && isLastOfGroup && (
                        <div className="mt-1 flex justify-end text-xs text-zinc-500">
                          {msg.status === "seen" && msg.seen ? (
                            <span className="inline-flex items-center gap-1">
                              <Check2 />
                              Seen
                            </span>
                          ) : msg.status === "sending" ? (
                            <span className="inline-flex items-center gap-1">
                              <Clock />
                              Sending
                            </span>
                          ) : msg.status === "failed" ? (
                            <span className="inline-flex items-center gap-1 text-red-300">
                              <X size={12} />
                              Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <Clock />
                              Sent
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <AnimatePresence>
          {showImagePopup && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setShowImagePopup(false)}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />

              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ y: 24, scale: 0.98, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 24, scale: 0.98, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="share-media-title"
                className="relative z-10 flex w-full max-w-md flex-col gap-5 rounded-[24px] border border-white/[0.12] bg-[#242424] p-5 shadow-2xl shadow-black/50 sm:p-6"
              >
                <div>
                  <h2 id="share-media-title" className="text-lg font-semibold text-white">
                    Share media
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">
                    Paste a direct image, video, document, or YouTube link.
                  </p>
                </div>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-zinc-300">Media URL</span>
                  <div className="relative flex w-full items-center">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      autoFocus
                      className="h-12 w-full rounded-2xl border border-white/[0.12] bg-black/[0.24] px-4 pr-11 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-300/60 focus:ring-2 focus:ring-blue-300/20"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          setImageUrl(text);
                        } catch (err) {
                          console.error("Failed to read clipboard contents: ", err);
                        }
                      }}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white"
                      title="Paste from clipboard"
                      aria-label="Paste from clipboard"
                    >
                      <Clipboard size={17} />
                    </button>
                  </div>
                </label>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowImagePopup(false)}
                    className="h-10 rounded-2xl border border-white/[0.12] bg-white/[0.06] px-4 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendUrl}
                    className="h-10 rounded-2xl bg-[#3b82f6] px-5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-[#2f78ed] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
                    disabled={!imageUrl.trim() || !chatReady}
                  >
                    Send
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <LightboxModal openData={lightboxData} onClose={closeLightbox} />

        <div className="shrink-0 border-t border-white/10 bg-[#151515] px-3 py-3 sm:px-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="mx-auto flex w-full max-w-5xl items-end gap-3"
          >
            <button
              type="button"
              onClick={() => setShowImagePopup(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-zinc-400 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!chatReady}
              aria-label="Attach media"
            >
              <Photo />
            </button>

            <div className="flex min-h-12 flex-1 items-end rounded-[24px] border border-[#464646] bg-[#171717] px-4 transition focus-within:border-[#5f5f5f]">
              <textarea
                ref={textareaRef}
                style={{ maxHeight: "170px", overflowY: "auto" }}
                className="chat-scrollbar min-h-12 flex-1 resize-none bg-transparent py-3 text-[15px] leading-6 text-zinc-100 outline-none placeholder:text-zinc-500"
                rows={1}
                placeholder={chatReady ? `Message ${receiverDisplayName}` : "Connecting"}
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
            </div>

            <button
              type="submit"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-white shadow-[0_10px_28px_rgba(59,130,246,0.26)] transition hover:bg-[#2f78ed] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
              disabled={!input.trim() || !chatReady}
              aria-label="Send message"
            >
              <ArrowUp size={21} strokeWidth={2.4} />
            </button>
          </form>
        </div>
      </main>
    </ChatShell>
  );
}
