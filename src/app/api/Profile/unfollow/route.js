import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/server/auth";
import { findUserByUsername } from "@/server/profile";
import { query } from "@/server/db";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const currentUser = await requireUser(request);
    const body = await request.json();
    const target = await findUserByUsername(body.unfollow_username);

    await query(
      `DELETE FROM auth_follows
       WHERE follower_user_id = $1 AND following_user_id = $2`,
      [currentUser.id, target.id]
    );

    return NextResponse.json({ success: true, message: "Unfollowed user." });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
