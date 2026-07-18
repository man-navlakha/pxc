import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
}

function shouldUseSsl(connectionString) {
  if (process.env.PGSSLMODE === "disable") return false;

  try {
    const { hostname } = new URL(connectionString);
    return !["localhost", "127.0.0.1", "::1"].includes(hostname);
  } catch {
    return true;
  }
}

loadEnv();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not configured.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: shouldUseSsl(process.env.DATABASE_URL)
    ? { rejectUnauthorized: false }
    : false,
});

try {
  await pool.query("BEGIN");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      profile_pic_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_follows (
      follower_user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      following_user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (follower_user_id, following_user_id),
      CHECK (follower_user_id <> following_user_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_ws_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      sender_user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      receiver_user_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE,
      support_thread_user_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      seen_at TIMESTAMPTZ,
      edited_at TIMESTAMPTZ,
      deleted_at TIMESTAMPTZ,
      CHECK (
        (receiver_user_id IS NOT NULL AND support_thread_user_id IS NULL)
        OR
        (receiver_user_id IS NULL AND support_thread_user_id IS NOT NULL)
      )
    );
  `);

  await pool.query(
    "CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx ON auth_sessions(user_id);"
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS auth_sessions_expires_at_idx ON auth_sessions(expires_at);"
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS auth_follows_following_user_id_idx ON auth_follows(following_user_id);"
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS auth_users_username_search_idx ON auth_users(username);"
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS auth_users_email_search_idx ON auth_users(email);"
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS auth_ws_tokens_token_hash_idx ON auth_ws_tokens(token_hash);"
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS auth_ws_tokens_expires_at_idx ON auth_ws_tokens(expires_at);"
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS chat_messages_direct_sender_receiver_idx ON chat_messages(sender_user_id, receiver_user_id, created_at);"
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS chat_messages_direct_receiver_sender_idx ON chat_messages(receiver_user_id, sender_user_id, created_at);"
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS chat_messages_support_thread_idx ON chat_messages(support_thread_user_id, created_at);"
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS chat_messages_unread_direct_idx ON chat_messages(receiver_user_id, seen_at) WHERE deleted_at IS NULL;"
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS chat_messages_unread_support_idx ON chat_messages(support_thread_user_id, seen_at) WHERE deleted_at IS NULL;"
  );

  await pool.query("COMMIT");
  console.log("Auth and chat database tables are ready.");
} catch (error) {
  await pool.query("ROLLBACK");
  console.error("Auth database migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
