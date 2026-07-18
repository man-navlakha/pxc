import pg from "pg";

const { Pool } = pg;

let pool;

function shouldUseSsl(connectionString) {
  if (process.env.PGSSLMODE === "disable") return false;

  try {
    const { hostname } = new URL(connectionString);
    return !["localhost", "127.0.0.1", "::1"].includes(hostname);
  } catch {
    return true;
  }
}

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      ssl: shouldUseSsl(process.env.DATABASE_URL)
        ? { rejectUnauthorized: false }
        : false,
    });
  }

  return pool;
}

export function query(text, params) {
  return getPool().query(text, params);
}
