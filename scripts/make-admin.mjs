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

const username = String(process.argv[2] || "").trim().toLowerCase();

if (!username) {
  console.error("Usage: npm run admin:make -- <username>");
  process.exit(1);
}

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
  const result = await pool.query(
    `UPDATE auth_users
     SET role = 'admin', updated_at = NOW()
     WHERE username = $1
     RETURNING username, email, role`,
    [username]
  );

  if (!result.rows[0]) {
    console.error(`No user found with username "${username}".`);
    process.exitCode = 1;
  } else {
    console.log(
      `Admin role applied to ${result.rows[0].username} (${result.rows[0].email}).`
    );
  }
} catch (error) {
  console.error("Admin role update failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
