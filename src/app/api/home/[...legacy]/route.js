import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LEGACY_API_BASE =
  process.env.LEGACY_API_BASE_URL || "https://pixel-classes.onrender.com/api/home";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function responseHeadersFrom(upstreamHeaders) {
  const headers = new Headers();
  const contentType = upstreamHeaders.get("content-type");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  return headers;
}

async function proxyLegacyHomeRequest(request, { params }) {
  const routeParams = await params;
  const legacyPath = (routeParams.legacy || [])
    .map((part) => encodeURIComponent(part))
    .join("/");
  const sourceUrl = new URL(request.url);
  const targetUrl = new URL(`${LEGACY_API_BASE}/${legacyPath}`);
  targetUrl.search = sourceUrl.search;

  const headers = new Headers(request.headers);
  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }

  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body: hasBody ? Buffer.from(await request.arrayBuffer()) : undefined,
    cache: "no-store",
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeadersFrom(upstream.headers),
  });
}

export const GET = proxyLegacyHomeRequest;
export const POST = proxyLegacyHomeRequest;
export const PUT = proxyLegacyHomeRequest;
export const PATCH = proxyLegacyHomeRequest;
export const DELETE = proxyLegacyHomeRequest;
