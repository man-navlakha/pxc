import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { query } from "./db.js";

export const SESSION_COOKIE = "pxc_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function publicUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role || "student",
    profile_pic: row.profile_pic_url || null,
    profile_pic_url: row.profile_pic_url || null,
    follower_count: Number(row.follower_count || 0),
    following_count: Number(row.following_count || 0),
    post_count: Number(row.post_count || 0),
    created_at: row.created_at,
  };
}

export function validateSignupInput({ username, email, password }) {
  const normalizedUsername = normalizeUsername(username);
  const normalizedEmail = normalizeEmail(email);

  if (!/^[a-z0-9._-]{3,32}$/.test(normalizedUsername)) {
    throw new ApiError(
      400,
      "Username must be 3-32 characters and use only letters, numbers, dots, underscores, or hyphens."
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new ApiError(400, "Please enter a valid email address.");
  }

  if (String(password || "").length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters.");
  }

  return {
    username: normalizedUsername,
    email: normalizedEmail,
    password: String(password),
  };
}

function hashSessionToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getRequestIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null
  );
}

export async function createUser({ username, email, password }) {
  const normalized = validateSignupInput({ username, email, password });
  const passwordHash = await bcrypt.hash(normalized.password, 12);

  try {
    const result = await query(
      `INSERT INTO auth_users (id, username, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role, profile_pic_url, created_at`,
      [crypto.randomUUID(), normalized.username, normalized.email, passwordHash]
    );

    return publicUser(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      throw new ApiError(409, "Username or email is already registered.");
    }
    throw error;
  }
}

export async function verifyUserPassword(usernameOrEmail, password) {
  const login = String(usernameOrEmail || "").trim().toLowerCase();
  if (!login || !password) {
    throw new ApiError(400, "Username and password are required.");
  }

  const result = await query(
    `SELECT id, username, email, role, profile_pic_url, password_hash, created_at
     FROM auth_users
     WHERE username = $1 OR email = $1
     LIMIT 1`,
    [login]
  );

  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(String(password), user.password_hash))) {
    throw new ApiError(401, "Invalid username or password.");
  }

  return publicUser(user);
}

export async function createSession(userId, request) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await query(
    `INSERT INTO auth_sessions
      (id, user_id, token_hash, expires_at, user_agent, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      crypto.randomUUID(),
      userId,
      tokenHash,
      expiresAt,
      request.headers.get("user-agent"),
      getRequestIp(request),
    ]
  );

  return { token, expiresAt };
}

export async function getCurrentUser(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const result = await query(
    `SELECT u.id, u.username, u.email, u.role, u.profile_pic_url, u.created_at,
            COUNT(DISTINCT followers.follower_user_id) AS follower_count,
            COUNT(DISTINCT following.following_user_id) AS following_count
     FROM auth_sessions s
     JOIN auth_users u ON u.id = s.user_id
     LEFT JOIN auth_follows followers ON followers.following_user_id = u.id
     LEFT JOIN auth_follows following ON following.follower_user_id = u.id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()
     GROUP BY u.id
     LIMIT 1`,
    [hashSessionToken(token)]
  );

  return publicUser(result.rows[0]);
}

export async function deleteCurrentSession(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return;

  await query("DELETE FROM auth_sessions WHERE token_hash = $1", [
    hashSessionToken(token),
  ]);
}

export async function touchCurrentSession(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const result = await query(
    `UPDATE auth_sessions
     SET last_used_at = NOW(), expires_at = NOW() + ($2 || ' seconds')::interval
     WHERE token_hash = $1 AND expires_at > NOW()
     RETURNING expires_at`,
    [hashSessionToken(token), SESSION_MAX_AGE_SECONDS]
  );

  return result.rows[0] || null;
}

export function setAuthCookies(response, session, user) {
  const cookieBase = {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };

  response.cookies.set(SESSION_COOKIE, session.token, {
    ...cookieBase,
    httpOnly: true,
  });
  response.cookies.set("Logged", "true", cookieBase);
  response.cookies.set("refresh", "true", cookieBase);
  response.cookies.set("username", user.username, cookieBase);
}

export function clearAuthCookies(response) {
  for (const name of [
    SESSION_COOKIE,
    "Logged",
    "refresh",
    "refresh_token",
    "access",
    "username",
    "profile_pic",
  ]) {
    response.cookies.set(name, "", {
      path: "/",
      expires: new Date(0),
    });
  }
}

export function jsonError(error) {
  const status = error instanceof ApiError ? error.status : 500;
  return {
    body: {
      success: false,
      error:
        status === 500
          ? "Something went wrong. Please try again."
          : error.message,
    },
    status,
  };
}

export async function requireUser(request) {
  const user = await getCurrentUser(request);
  if (!user) throw new ApiError(401, "Authentication required.");
  return user;
}
