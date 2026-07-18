import crypto from "node:crypto";
import { ApiError, normalizeUsername, publicUser } from "./auth.js";
import { query } from "./db.js";

export const PIXEL_SUPPORT_USERNAME = "pixel";
export const PIXEL_SUPPORT_PROFILE = {
  id: "pixel-support",
  username: PIXEL_SUPPORT_USERNAME,
  display_name: "Pixel Help Buddy",
  first_name: "Pixel",
  last_name: "Help Buddy",
  role: "support",
  profile_pic: "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png",
  profile_pic_url: "https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png",
  is_online: true,
};

const WS_TOKEN_MAX_AGE_SECONDS = 10 * 60;
const ADMIN_ROLES = new Set(["admin", "owner", "staff"]);

function hashOpaqueToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function isAdminUser(user) {
  return ADMIN_ROLES.has(String(user?.role || "").toLowerCase());
}

function normalizeMessageContent(content) {
  const message = String(content || "").trim();
  if (!message) throw new ApiError(400, "Message is required.");
  if (message.length > 4000) {
    throw new ApiError(400, "Message must be 4000 characters or fewer.");
  }
  return message;
}

export function directConversationKey(firstUsername, secondUsername) {
  return `direct:${[normalizeUsername(firstUsername), normalizeUsername(secondUsername)]
    .sort()
    .join(":")}`;
}

export function supportConversationKey(threadUsername) {
  return `support:${normalizeUsername(threadUsername)}`;
}

export function conversationKeyFromMessage(message) {
  if (message.support_thread_username) {
    return supportConversationKey(message.support_thread_username);
  }

  return directConversationKey(message.sender, message.receiver);
}

async function findAuthUserByUsername(username) {
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername) throw new ApiError(400, "Username is required.");

  const result = await query(
    `SELECT id, username, email, role, profile_pic_url, created_at
     FROM auth_users
     WHERE username = $1
     LIMIT 1`,
    [normalizedUsername]
  );

  const user = publicUser(result.rows[0]);
  if (!user) throw new ApiError(404, "User not found.");
  return user;
}

export async function createWsToken(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + WS_TOKEN_MAX_AGE_SECONDS * 1000);

  await query("DELETE FROM auth_ws_tokens WHERE expires_at <= NOW();");
  await query(
    `INSERT INTO auth_ws_tokens (id, user_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [crypto.randomUUID(), userId, hashOpaqueToken(token), expiresAt]
  );

  return { token, expiresAt };
}

export async function getUserForWsToken(token) {
  if (!token) throw new ApiError(401, "WebSocket token is required.");

  const result = await query(
    `SELECT u.id, u.username, u.email, u.role, u.profile_pic_url, u.created_at
     FROM auth_ws_tokens t
     JOIN auth_users u ON u.id = t.user_id
     WHERE t.token_hash = $1 AND t.expires_at > NOW()
     LIMIT 1`,
    [hashOpaqueToken(token)]
  );

  const user = publicUser(result.rows[0]);
  if (!user) throw new ApiError(401, "Invalid or expired WebSocket token.");
  return user;
}

export async function listAdminUsers() {
  const result = await query(
    `SELECT id, username, email, role, profile_pic_url, created_at
     FROM auth_users
     WHERE LOWER(role) = ANY($1::text[])
     ORDER BY username ASC`,
    [Array.from(ADMIN_ROLES)]
  );

  return result.rows.map(publicUser);
}

export async function getConversationContext(
  currentUser,
  receiverUsername,
  supportUsername = null
) {
  const receiver = normalizeUsername(receiverUsername);
  if (!receiver) throw new ApiError(400, "Receiver is required.");

  if (receiver === PIXEL_SUPPORT_USERNAME) {
    const requestedSupportUsername = normalizeUsername(supportUsername);
    let threadUser = currentUser;

    if (
      requestedSupportUsername &&
      requestedSupportUsername !== currentUser.username
    ) {
      if (!isAdminUser(currentUser)) {
        throw new ApiError(403, "Only admins can open another user's support thread.");
      }
      threadUser = await findAuthUserByUsername(requestedSupportUsername);
    }

    return {
      type: "support",
      key: supportConversationKey(threadUser.username),
      threadUser,
      receiverUsername: PIXEL_SUPPORT_USERNAME,
    };
  }

  const receiverUser = await findAuthUserByUsername(receiver);
  if (receiverUser.id === currentUser.id) {
    throw new ApiError(400, "Choose another user to chat with.");
  }

  return {
    type: "direct",
    key: directConversationKey(currentUser.username, receiverUser.username),
    receiverUser,
    receiverUsername: receiverUser.username,
  };
}

function messageFromRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    sender: row.sender_username,
    receiver: row.receiver_username || PIXEL_SUPPORT_USERNAME,
    content: row.content,
    message: row.content,
    is_seen: Boolean(row.seen_at),
    seen_at: row.seen_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    edited_at: row.edited_at,
    is_edited: Boolean(row.edited_at),
    is_support_thread: Boolean(row.support_thread_username),
    support_thread_username: row.support_thread_username || null,
  };
}

async function getMessageById(messageId) {
  const result = await query(
    `SELECT m.id, m.sender_user_id, m.receiver_user_id, m.support_thread_user_id,
            m.content, m.created_at, m.updated_at, m.seen_at, m.edited_at,
            sender.username AS sender_username,
            receiver.username AS receiver_username,
            support_owner.username AS support_thread_username
     FROM chat_messages m
     JOIN auth_users sender ON sender.id = m.sender_user_id
     LEFT JOIN auth_users receiver ON receiver.id = m.receiver_user_id
     LEFT JOIN auth_users support_owner ON support_owner.id = m.support_thread_user_id
     WHERE m.id = $1 AND m.deleted_at IS NULL
     LIMIT 1`,
    [messageId]
  );

  return messageFromRow(result.rows[0]);
}

export async function listChatHistory(
  currentUser,
  receiverUsername,
  supportUsername = null
) {
  const context = await getConversationContext(
    currentUser,
    receiverUsername,
    supportUsername
  );

  const params =
    context.type === "support"
      ? [context.threadUser.id]
      : [currentUser.id, context.receiverUser.id];

  const where =
    context.type === "support"
      ? "m.support_thread_user_id = $1"
      : `m.receiver_user_id IS NOT NULL AND
         ((m.sender_user_id = $1 AND m.receiver_user_id = $2)
          OR (m.sender_user_id = $2 AND m.receiver_user_id = $1))`;

  const result = await query(
    `SELECT m.id, m.sender_user_id, m.receiver_user_id, m.support_thread_user_id,
            m.content, m.created_at, m.updated_at, m.seen_at, m.edited_at,
            sender.username AS sender_username,
            receiver.username AS receiver_username,
            support_owner.username AS support_thread_username
     FROM chat_messages m
     JOIN auth_users sender ON sender.id = m.sender_user_id
     LEFT JOIN auth_users receiver ON receiver.id = m.receiver_user_id
     LEFT JOIN auth_users support_owner ON support_owner.id = m.support_thread_user_id
     WHERE ${where} AND m.deleted_at IS NULL
     ORDER BY m.created_at ASC`,
    params
  );

  return result.rows.map(messageFromRow);
}

export async function createChatMessage(
  currentUser,
  receiverUsername,
  content,
  supportUsername = null
) {
  const message = normalizeMessageContent(content);
  const context = await getConversationContext(
    currentUser,
    receiverUsername,
    supportUsername
  );
  const id = crypto.randomUUID();

  await query(
    `INSERT INTO chat_messages
       (id, sender_user_id, receiver_user_id, support_thread_user_id, content)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      id,
      currentUser.id,
      context.type === "direct" ? context.receiverUser.id : null,
      context.type === "support" ? context.threadUser.id : null,
      message,
    ]
  );

  return {
    message: await getMessageById(id),
    context,
  };
}

export async function markMessageSeen(currentUser, messageId) {
  const rawResult = await query(
    `SELECT id, sender_user_id, receiver_user_id, support_thread_user_id
     FROM chat_messages
     WHERE id = $1 AND deleted_at IS NULL
     LIMIT 1`,
    [messageId]
  );
  const message = rawResult.rows[0];
  if (!message) throw new ApiError(404, "Message not found.");

  if (message.sender_user_id === currentUser.id) {
    return getMessageById(message.id);
  }

  const canSeeDirect = message.receiver_user_id === currentUser.id;
  const canSeeSupportAsOwner = message.support_thread_user_id === currentUser.id;
  const canSeeSupportAsAdmin =
    Boolean(message.support_thread_user_id) && isAdminUser(currentUser);

  if (!canSeeDirect && !canSeeSupportAsOwner && !canSeeSupportAsAdmin) {
    throw new ApiError(403, "You cannot mark this message as seen.");
  }

  await query(
    `UPDATE chat_messages
     SET seen_at = COALESCE(seen_at, NOW()), updated_at = NOW()
     WHERE id = $1`,
    [message.id]
  );

  return getMessageById(message.id);
}

export async function editChatMessage(currentUser, messageId, content) {
  const message = normalizeMessageContent(content);
  const result = await query(
    `UPDATE chat_messages
     SET content = $3, edited_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND sender_user_id = $2 AND deleted_at IS NULL
     RETURNING id`,
    [messageId, currentUser.id, message]
  );

  if (!result.rows[0]) {
    throw new ApiError(404, "Message not found or you cannot edit it.");
  }

  return getMessageById(messageId);
}

export async function deleteChatMessage(currentUser, messageId) {
  const result = await query(
    `UPDATE chat_messages
     SET deleted_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND sender_user_id = $2 AND deleted_at IS NULL
     RETURNING id`,
    [messageId, currentUser.id]
  );

  if (!result.rows[0]) {
    throw new ApiError(404, "Message not found or you cannot delete it.");
  }

  return { success: true };
}

function latestMessageFromInboxRow(row) {
  if (!row?.latest_message_id) return null;

  return {
    id: row.latest_message_id,
    content: row.latest_content,
    message: row.latest_content,
    sender_username: row.latest_sender_username,
    is_seen: Boolean(row.latest_seen_at),
    seen_at: row.latest_seen_at,
    timestamp: row.latest_created_at,
    created_at: row.latest_created_at,
    is_edited: Boolean(row.latest_edited_at),
  };
}

async function listDirectInboxItems(user) {
  const result = await query(
    `WITH message_rows AS (
       SELECT m.*,
              CASE
                WHEN m.sender_user_id = $1 THEN m.receiver_user_id
                ELSE m.sender_user_id
              END AS other_user_id
       FROM chat_messages m
       WHERE m.receiver_user_id IS NOT NULL
         AND m.deleted_at IS NULL
         AND (m.sender_user_id = $1 OR m.receiver_user_id = $1)
     ),
     ranked AS (
       SELECT *,
              ROW_NUMBER() OVER (
                PARTITION BY other_user_id
                ORDER BY created_at DESC, id DESC
              ) AS rn
       FROM message_rows
     )
     SELECT u.id AS user_id, u.username, u.email, u.role, u.profile_pic_url,
            r.id AS latest_message_id,
            r.content AS latest_content,
            r.created_at AS latest_created_at,
            r.seen_at AS latest_seen_at,
            r.edited_at AS latest_edited_at,
            latest_sender.username AS latest_sender_username,
            (
              SELECT COUNT(*)
              FROM chat_messages unread
              WHERE unread.receiver_user_id = $1
                AND unread.sender_user_id = u.id
                AND unread.seen_at IS NULL
                AND unread.deleted_at IS NULL
            ) AS unread_count
     FROM ranked r
     JOIN auth_users u ON u.id = r.other_user_id
     JOIN auth_users latest_sender ON latest_sender.id = r.sender_user_id
     WHERE r.rn = 1
     ORDER BY r.created_at DESC`,
    [user.id]
  );

  return result.rows.map((row) => ({
    id: row.user_id,
    username: row.username,
    first_name: "",
    last_name: "",
    profile_pic: row.profile_pic_url,
    profile_pic_url: row.profile_pic_url,
    latest_message: latestMessageFromInboxRow(row),
    timestamp: row.latest_created_at,
    unread_count: Number(row.unread_count || 0),
    is_online: false,
    is_support_thread: false,
    conversation_key: directConversationKey(user.username, row.username),
  }));
}

async function getPixelSupportContact(user) {
  const latestResult = await query(
    `SELECT m.id AS latest_message_id,
            m.content AS latest_content,
            m.created_at AS latest_created_at,
            m.seen_at AS latest_seen_at,
            m.edited_at AS latest_edited_at,
            latest_sender.username AS latest_sender_username
     FROM chat_messages m
     JOIN auth_users latest_sender ON latest_sender.id = m.sender_user_id
     WHERE m.support_thread_user_id = $1 AND m.deleted_at IS NULL
     ORDER BY m.created_at DESC, m.id DESC
     LIMIT 1`,
    [user.id]
  );

  const unreadResult = await query(
    `SELECT COUNT(*) AS count
     FROM chat_messages
     WHERE support_thread_user_id = $1
       AND sender_user_id <> $1
       AND seen_at IS NULL
       AND deleted_at IS NULL`,
    [user.id]
  );

  const latestRow = latestResult.rows[0] || {};
  return {
    ...PIXEL_SUPPORT_PROFILE,
    latest_message:
      latestMessageFromInboxRow(latestRow) || "Need help with a project? Message Pixel.",
    timestamp: latestRow.latest_created_at || null,
    unread_count: Number(unreadResult.rows[0]?.count || 0),
    is_support_thread: true,
    support_username: user.username,
    conversation_key: supportConversationKey(user.username),
    is_pinned: true,
  };
}

async function listAdminSupportInboxItems() {
  const result = await query(
    `WITH ranked AS (
       SELECT m.*,
              ROW_NUMBER() OVER (
                PARTITION BY m.support_thread_user_id
                ORDER BY m.created_at DESC, m.id DESC
              ) AS rn
       FROM chat_messages m
       WHERE m.support_thread_user_id IS NOT NULL
         AND m.deleted_at IS NULL
     )
     SELECT thread_user.id AS thread_user_id,
            thread_user.username AS thread_username,
            thread_user.profile_pic_url AS thread_profile_pic_url,
            r.id AS latest_message_id,
            r.content AS latest_content,
            r.created_at AS latest_created_at,
            r.seen_at AS latest_seen_at,
            r.edited_at AS latest_edited_at,
            latest_sender.username AS latest_sender_username,
            (
              SELECT COUNT(*)
              FROM chat_messages unread
              JOIN auth_users unread_sender ON unread_sender.id = unread.sender_user_id
              WHERE unread.support_thread_user_id = thread_user.id
                AND unread.seen_at IS NULL
                AND unread.deleted_at IS NULL
                AND LOWER(unread_sender.role) <> ALL($1::text[])
            ) AS unread_count
     FROM ranked r
     JOIN auth_users thread_user ON thread_user.id = r.support_thread_user_id
     JOIN auth_users latest_sender ON latest_sender.id = r.sender_user_id
     WHERE r.rn = 1
     ORDER BY r.created_at DESC`,
    [Array.from(ADMIN_ROLES)]
  );

  return result.rows.map((row) => ({
    ...PIXEL_SUPPORT_PROFILE,
    id: `pixel-support-${row.thread_user_id}`,
    username: PIXEL_SUPPORT_USERNAME,
    display_name: `Pixel Help: ${row.thread_username}`,
    latest_message: latestMessageFromInboxRow(row),
    timestamp: row.latest_created_at,
    unread_count: Number(row.unread_count || 0),
    is_support_thread: true,
    support_username: row.thread_username,
    thread_profile_pic: row.thread_profile_pic_url,
    conversation_key: supportConversationKey(row.thread_username),
  }));
}

export async function buildInboxForUser(user) {
  const directItems = await listDirectInboxItems(user);
  const supportItems = isAdminUser(user)
    ? await listAdminSupportInboxItems()
    : [await getPixelSupportContact(user)];

  return [...supportItems, ...directItems].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    if (a.unread_count > 0 && b.unread_count === 0) return -1;
    if (a.unread_count === 0 && b.unread_count > 0) return 1;

    const at = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const bt = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return bt - at;
  });
}

export async function getTotalUnreadCount(user) {
  const directResult = await query(
    `SELECT COUNT(*) AS count
     FROM chat_messages
     WHERE receiver_user_id = $1
       AND sender_user_id <> $1
       AND seen_at IS NULL
       AND deleted_at IS NULL`,
    [user.id]
  );

  const supportSql = isAdminUser(user)
    ? `SELECT COUNT(*) AS count
       FROM chat_messages m
       JOIN auth_users sender ON sender.id = m.sender_user_id
       WHERE m.support_thread_user_id IS NOT NULL
         AND m.seen_at IS NULL
         AND m.deleted_at IS NULL
         AND LOWER(sender.role) <> ALL($1::text[])`
    : `SELECT COUNT(*) AS count
       FROM chat_messages
       WHERE support_thread_user_id = $1
         AND sender_user_id <> $1
         AND seen_at IS NULL
         AND deleted_at IS NULL`;

  const supportParams = isAdminUser(user) ? [Array.from(ADMIN_ROLES)] : [user.id];
  const supportResult = await query(supportSql, supportParams);

  return (
    Number(directResult.rows[0]?.count || 0) +
    Number(supportResult.rows[0]?.count || 0)
  );
}

export async function usernamesToNotifyForMessage(message) {
  const usernames = new Set([message.sender]);

  if (message.support_thread_username) {
    usernames.add(message.support_thread_username);
    const admins = await listAdminUsers();
    admins.forEach((admin) => usernames.add(admin.username));
  } else if (message.receiver) {
    usernames.add(message.receiver);
  }

  return Array.from(usernames);
}
