import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/server/auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await requireUser(request);
    return NextResponse.json({ posts: [] });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
