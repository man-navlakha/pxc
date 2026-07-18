import { NextResponse } from "next/server";
import {
  SESSION_MAX_AGE_SECONDS,
  getCurrentUser,
  touchCurrentSession,
} from "@/server/auth";

export const runtime = "nodejs";

export async function POST(request) {
  const user = await getCurrentUser(request);
  const session = user ? await touchCurrentSession(request) : null;

  if (!user || !session) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    success: true,
    message: "Session refreshed.",
    user,
  });

  response.cookies.set("Logged", "true", {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  response.cookies.set("refresh", "true", {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
