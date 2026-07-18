import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/server/auth";
import { listChatHistory } from "@/server/chat";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const url = new URL(request.url);
    const messages = await listChatHistory(
      user,
      id,
      url.searchParams.get("support_user")
    );

    return NextResponse.json(messages);
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
