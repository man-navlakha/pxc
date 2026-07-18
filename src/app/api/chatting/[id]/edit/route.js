import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/server/auth";
import { editChatMessage } from "@/server/chat";

export const runtime = "nodejs";

async function updateMessage(request, { params }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const message = await editChatMessage(user, id, body.content);

    return NextResponse.json(message);
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}

export const PUT = updateMessage;
export const POST = updateMessage;
