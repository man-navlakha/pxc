export function buildWebSocketUrl(pathname) {
  const configuredBase = process.env.NEXT_PUBLIC_WS_URL;
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (configuredBase) {
    const base = new URL(configuredBase);
    if (base.protocol === "https:") base.protocol = "wss:";
    if (base.protocol === "http:") base.protocol = "ws:";
    return new URL(normalizedPath, base);
  }

  const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
  const url = new URL(`${wsScheme}://${window.location.host}${normalizedPath}`);
  const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

  if (window.location.protocol === "http:" && localHosts.has(window.location.hostname)) {
    url.port = process.env.NEXT_PUBLIC_WS_PORT || "3001";
  }

  return url;
}

export function shouldAttemptWebSocket() {
  if (process.env.NEXT_PUBLIC_WS_URL) return true;
  if (typeof window === "undefined") return false;
  return !window.location.hostname.endsWith(".vercel.app");
}
