export function buildWebSocketUrl(pathname) {
  const configuredBase = process.env.NEXT_PUBLIC_WS_URL;
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (configuredBase) {
    return new URL(normalizedPath, configuredBase);
  }

  const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
  const url = new URL(`${wsScheme}://${window.location.host}${normalizedPath}`);
  const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

  if (window.location.protocol === "http:" && localHosts.has(window.location.hostname)) {
    url.port = process.env.NEXT_PUBLIC_WS_PORT || "3001";
  }

  return url;
}
