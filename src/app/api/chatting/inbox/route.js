import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/server/auth";
import { buildInboxForUser, getTotalUnreadCount } from "@/server/chat";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const user = await requireUser(request);
    const inbox = await buildInboxForUser(user);
    const totalUnreadCount = await getTotalUnreadCount(user);

    return NextResponse.json({
      inbox,
      total_unread_count: totalUnreadCount,
      total_unseen_count: totalUnreadCount,
    });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
