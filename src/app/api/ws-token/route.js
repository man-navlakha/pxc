import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/server/auth";
import { createWsToken } from "@/server/chat";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const user = await requireUser(request);
    const wsToken = await createWsToken(user.id);
    return NextResponse.json({
      ws_token: wsToken.token,
      expires_at: wsToken.expiresAt,
    });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
