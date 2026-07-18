import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/server/auth";
import { listFollowers } from "@/server/profile";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const currentUser = await requireUser(request);
    const body = await request.json().catch(() => ({}));
    const users = await listFollowers(body.username || currentUser.username);

    return NextResponse.json(users);
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
