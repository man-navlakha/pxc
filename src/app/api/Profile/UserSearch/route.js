import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/server/auth";
import { searchUsers } from "@/server/profile";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await requireUser(request);
    const { searchParams } = new URL(request.url);
    const users = await searchUsers(searchParams.get("username"));

    return NextResponse.json(users);
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
