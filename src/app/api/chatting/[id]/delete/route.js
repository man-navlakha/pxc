import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/server/auth";
import { deleteChatMessage } from "@/server/chat";

export const runtime = "nodejs";

export async function DELETE(request, { params }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const result = await deleteChatMessage(user, id);

    return NextResponse.json(result);
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
