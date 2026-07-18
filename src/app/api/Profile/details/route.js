import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/server/auth";
import { findUserByUsername } from "@/server/profile";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const currentUser = await requireUser(request);
    const body = await request.json().catch(() => ({}));
    const url = new URL(request.url);
    const username =
      body.username || url.searchParams.get("username") || currentUser.username;
    const user = await findUserByUsername(username);

    return NextResponse.json(user);
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
