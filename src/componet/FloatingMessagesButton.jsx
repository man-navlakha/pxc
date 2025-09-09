import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";


export default function FloatingMessagesButton() {
  const USERNAME = Cookies.get("username");
  const token = Cookies.get("refresh_token"); // JWT refresh token
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // if (!USERNAME || !token) return;

    // Connect to Notification WebSocket
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
const socket = new WebSocket(`${wsScheme}://${window.location.host}/ws/notifications/`);


    socket.onopen = () => {
      console.log("[WS CONNECT] Connected to notifications WebSocket");
      console.log(wsUrl)
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
      className="fixed ccf hidden md:hidden lg:block bottom-[3rem] right-6  border border-[#f8f9f90d] space-x-4 hover:bg-[#3A3B3C] bg-[#212328] rounded-full px-6 py-3 max-w-[120px] w-full shadow-lg z-50"
    >
        <div className=" flex items-center gap-2 justify-center">
      <div className="relative">
         <a href="/Chat" className="flex flex-col items-center text-white hover:text-blue-400">
            <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.1" d="M21 13V7C21 5.11438 21 4.17157 20.4142 3.58579C19.8284 3 18.8856 3 17 3H7C5.11438 3 4.17157 3 3.58579 3.58579C3 4.17157 3 5.11438 3 7V13C3 14.8856 3 15.8284 3.58579 16.4142C4.17157 17 5.11438 17 7 17H7.5C7.77614 17 8 17.2239 8 17.5V20V20.1499C8 20.5037 8.40137 20.7081 8.6875 20.5L13.0956 17.2941C13.3584 17.103 13.675 17 14 17H17C18.8856 17 19.8284 17 20.4142 16.4142C21 15.8284 21 14.8856 21 13Z" fill="#fff"></path> <path d="M8 10H8.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M12 10H12.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M16 10H16.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M21 13V7C21 5.11438 21 4.17157 20.4142 3.58579C19.8284 3 18.8856 3 17 3H7C5.11438 3 4.17157 3 3.58579 3.58579C3 4.17157 3 5.11438 3 7V13C3 14.8856 3 15.8284 3.58579 16.4142C4.17157 17 5.11438 17 7 17H7.5C7.77614 17 8 17.2239 8 17.5V20V20.1499C8 20.5037 8.40137 20.7081 8.6875 20.5L13.0956 17.2941C13.3584 17.103 13.675 17 14 17H17C18.8856 17 19.8284 17 20.4142 16.4142C21 15.8284 21 14.8856 21 13Z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"></path> </g></svg>
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
