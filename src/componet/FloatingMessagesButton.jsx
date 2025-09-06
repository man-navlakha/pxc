import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function FloatingMessagesButton() {
  const USERNAME = Cookies.get("username");
  const token = Cookies.get("refresh_token"); // JWT refresh token
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!USERNAME || !token) return;

    // Connect to Notification WebSocket
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsScheme}://pixel-classes.onrender.com/ws/notifications/?token=${token}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("[WS CONNECT] Connected to notifications WebSocket");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "total_unseen_count") {
          setUnreadCount(data.total_unseen_count || 0);
        }
      } catch (err) {
        console.error("[WS ERROR] Failed to parse message:", err);
      }
    };

    socket.onclose = () => {
      console.log("[WS DISCONNECT] Notifications WebSocket closed");
    };

    socket.onerror = (err) => {
      console.error("[WS ERROR] WebSocket error:", err);
    };

    // Cleanup on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) socket.close();
    };
  }, [USERNAME, token]);

  return (
    <button
      onClick={() => navigate("/chat")}
      className="fixed ccf hidden md:hidden lg:block bottom-[3rem] right-6 border border-[#f8f9f90d] space-x-4 hover:bg-[#3A3B3C] bg-[#212328] rounded-full px-6 py-3 max-w-[120px] w-full shadow-lg z-50"
    >
      <div className="flex items-center gap-2 justify-center">
        <div className="relative">
          <a
            href="/Chat"
            className="flex flex-col items-center text-white hover:text-blue-400"
          >
            {/* Chat Icon SVG */}
          </a>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#FF3B30] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center leading-none select-none">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-white font-semibold text-lg">Chat</span>
      </div>
    </button>
  );
}
