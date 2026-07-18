import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import next from "next";
import { WebSocketServer } from "ws";
import {
  buildInboxForUser,
  conversationKeyFromMessage,
  createChatMessage,
  getConversationContext,
  getTotalUnreadCount,
  getUserForWsToken,
  markMessageSeen,
} from "./src/server/chat.js";
import { query } from "./src/server/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
}

loadEnv();

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOST || "localhost";
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const wsPort = Number(process.env.WS_PORT || (dev ? port + 1 : port));
const wsRoutes = new Set([
  "/ws/chat",
  "/ws/message-inbox",
  "/ws/notifications",
]);

const chatSockets = new Map();
const inboxSockets = new Map();
const notificationSockets = new Map();
const connectedUsers = new Map();
const wss = new WebSocketServer({ noServer: true });
const WS_OPEN = 1;

function sendJson(ws, payload) {
  if (ws.readyState !== WS_OPEN) return;

  try {
    ws.send(JSON.stringify(payload), (error) => {
      if (error) {
        console.error("[ws] send callback failed:", error);
      }
    });
  } catch (error) {
    console.error("[ws] send failed:", error);
  }
}

function trackSocket(map, key, ws) {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(ws);

  return () => {
    const sockets = map.get(key);
    if (!sockets) return;
    sockets.delete(ws);
    if (sockets.size === 0) map.delete(key);
  };
}

function trackConnectedUser(user, ws) {
  const existing = connectedUsers.get(user.username) || { user, count: 0 };
  existing.user = user;
  existing.count += 1;
  connectedUsers.set(user.username, existing);

  ws.once("close", () => {
    const current = connectedUsers.get(user.username);
    if (!current) return;
    current.count -= 1;
    if (current.count <= 0) connectedUsers.delete(user.username);
  });
}

function connectedAdminUsernames() {
  return Array.from(connectedUsers.values())
    .filter(({ user }) => ["admin", "owner", "staff"].includes(String(user.role || "").toLowerCase()))
    .map(({ user }) => user.username);
}

function notificationTargetsForMessage(message) {
  const usernames = new Set([message.sender]);

  if (message.support_thread_username) {
    usernames.add(message.support_thread_username);
    connectedAdminUsernames().forEach((username) => usernames.add(username));
  } else if (message.receiver) {
    usernames.add(message.receiver);
  }

  return Array.from(usernames);
}

async function findUserByUsername(username) {
  const result = await query(
    `SELECT id, username, email, role, profile_pic_url, created_at
     FROM auth_users
     WHERE username = $1
     LIMIT 1`,
    [String(username || "").trim().toLowerCase()]
  );

  return result.rows[0]
    ? {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email,
        role: result.rows[0].role,
        profile_pic: result.rows[0].profile_pic_url,
        profile_pic_url: result.rows[0].profile_pic_url,
        created_at: result.rows[0].created_at,
      }
    : null;
}

async function sendInboxSnapshot(user) {
  const inbox = await buildInboxForUser(user);
  const totalUnreadCount = await getTotalUnreadCount(user);

  for (const ws of inboxSockets.get(user.username) || []) {
    sendJson(ws, {
      type: "inbox_data",
      inbox,
      total_unread_count: totalUnreadCount,
    });
    sendJson(ws, {
      type: "total_unread_update",
      total_unread_count: totalUnreadCount,
    });
  }

  for (const ws of notificationSockets.get(user.username) || []) {
    sendJson(ws, {
      type: "total_unseen_count",
      total_unseen_count: totalUnreadCount,
    });
  }
}

async function broadcastInboxSnapshots(usernames) {
  await Promise.all(
    [...new Set(usernames)].map(async (username) => {
      const user = await findUserByUsername(username);
      if (!user) return;
      await sendInboxSnapshot(user);
    })
  );
}

function broadcastChatPayload(message, tempId = null) {
  const key = conversationKeyFromMessage(message);
  const payload = {
    type: "chat",
    temp_id: tempId,
    ...message,
    message: message.content,
  };

  for (const ws of chatSockets.get(key) || []) {
    sendJson(ws, payload);
  }
}

function broadcastSeenPayload(message) {
  const key = conversationKeyFromMessage(message);

  for (const ws of chatSockets.get(key) || []) {
    sendJson(ws, {
      type: "seen",
      message_id: message.id,
      seen_at: message.seen_at,
    });
  }
}

async function attachChatSocket(ws, user, url) {
  const receiver = url.searchParams.get("receiver");
  const supportUsername = url.searchParams.get("support_user");
  const context = await getConversationContext(user, receiver, supportUsername);
  const untrack = trackSocket(chatSockets, context.key, ws);

  ws.on("error", (error) => {
    console.error(`[ws/chat] socket error user=${user.username}:`, error);
  });

  ws.on("message", async (raw) => {
    try {
      const payload = JSON.parse(String(raw));

      if (payload.type === "chat") {
        const result = await createChatMessage(
          user,
          payload.receiver || receiver,
          payload.message,
          payload.support_user || supportUsername
        );

        broadcastChatPayload(result.message, payload.temp_id || null);
        await broadcastInboxSnapshots(notificationTargetsForMessage(result.message));
        return;
      }

      if (payload.type === "seen" && payload.message_id) {
        const message = await markMessageSeen(user, payload.message_id);
        broadcastSeenPayload(message);
        await broadcastInboxSnapshots(notificationTargetsForMessage(message));
      }
    } catch (error) {
      console.error("[ws/chat] message failed:", error);
      sendJson(ws, {
        type: "error",
        message: error.message || "Chat WebSocket error.",
      });
    }
  });

  ws.on("close", () => {
    untrack();
  });

  setImmediate(() => {
    sendJson(ws, {
      type: "ready",
      conversation_key: context.key,
    });
  });
}

async function attachInboxSocket(ws, user) {
  const untrack = trackSocket(inboxSockets, user.username, ws);
  await sendInboxSnapshot(user);

  ws.on("error", (error) => {
    console.error(`[ws/inbox] socket error user=${user.username}:`, error);
  });

  ws.on("message", async (raw) => {
    try {
      const payload = JSON.parse(String(raw));
      if (payload.type === "refresh_inbox") {
        await sendInboxSnapshot(user);
      }
    } catch (error) {
      console.error("[ws/inbox] message failed:", error);
      sendJson(ws, {
        type: "error",
        message: error.message || "Inbox WebSocket error.",
      });
    }
  });

  ws.on("close", () => {
    untrack();
  });
}

async function attachNotificationSocket(ws, user) {
  const untrack = trackSocket(notificationSockets, user.username, ws);
  const totalUnreadCount = await getTotalUnreadCount(user);

  sendJson(ws, {
    type: "total_unseen_count",
    total_unseen_count: totalUnreadCount,
  });

  ws.on("error", (error) => {
    console.error(`[ws/notifications] socket error user=${user.username}:`, error);
  });

  ws.on("close", () => {
    untrack();
  });
}

async function handleWsConnection(ws, request, pathname) {
  ws.on("error", (error) => {
    console.error(`[ws] raw error path=${pathname}:`, error);
  });

  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    sendJson(ws, { type: "connecting" });
    const user = await getUserForWsToken(url.searchParams.get("token"));
    trackConnectedUser(user, ws);

    if (pathname === "/ws/chat") {
      await attachChatSocket(ws, user, url);
      return;
    }

    if (pathname === "/ws/message-inbox") {
      await attachInboxSocket(ws, user);
      return;
    }

    if (pathname === "/ws/notifications") {
      await attachNotificationSocket(ws, user);
      return;
    }

    ws.close(1008, "Unsupported WebSocket route.");
  } catch (error) {
    console.error("[ws] connection failed:", error);
    sendJson(ws, {
      type: "error",
      message: error.message || "WebSocket authentication failed.",
    });
    ws.close(1008, "WebSocket authentication failed.");
  }
}

app.prepare().then(() => {
  const handleUpgrade = app.getUpgradeHandler();
  const server = createServer((request, response) => {
    handle(request, response);
  });
  server.timeout = 0;

  const handleSocketUpgrade = (request, socket, head, passThroughToNext) => {
    socket.setTimeout(0);
    socket.setNoDelay(true);

    const url = new URL(request.url, `http://${request.headers.host}`);
    const pathname = url.pathname.replace(/\/$/, "");

    if (!wsRoutes.has(pathname)) {
      if (passThroughToNext) {
        handleUpgrade(request, socket, head);
      } else {
        socket.destroy();
      }
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      ws._socket?.setTimeout(0);
      wss.emit("connection", ws, request, pathname);
    });
  };

  server.on("upgrade", (request, socket, head) => {
    if (wsPort === port) {
      handleSocketUpgrade(request, socket, head, true);
      return;
    }

    handleUpgrade(request, socket, head);
  });

  wss.on("connection", (ws, request, pathname) => {
    handleWsConnection(ws, request, pathname);
  });

  if (wsPort !== port) {
    const wsServer = createServer((request, response) => {
      response.writeHead(404, { "content-type": "text/plain" });
      response.end("WebSocket endpoint only.");
    });
    wsServer.timeout = 0;
    wsServer.on("upgrade", (request, socket, head) => {
      handleSocketUpgrade(request, socket, head, false);
    });
    wsServer.listen(wsPort, () => {
      console.log(`WebSocket ready on ws://${hostname}:${wsPort}`);
    });
  }

  server.listen(port, () => {
    console.log(`Ready on http://${hostname}:${port}`);
  });
});
