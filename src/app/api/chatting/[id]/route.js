import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/server/auth";
import { createChatMessage, listChatHistory } from "@/server/chat";

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

export async function POST(request, { params }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const result = await createChatMessage(
      user,
      id,
      body.content || body.message,
      body.support_user
    );

    return NextResponse.json(result.message, { status: 201 });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
