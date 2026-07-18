import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/server/auth";
import { findUserByUsername } from "@/server/profile";
import { query } from "@/server/db";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const currentUser = await requireUser(request);
    const body = await request.json();
    const target = await findUserByUsername(body.follow_username);

    if (target.id === currentUser.id) {
      return NextResponse.json(
        { success: false, error: "You cannot follow yourself." },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO auth_follows (follower_user_id, following_user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [currentUser.id, target.id]
    );

    return NextResponse.json({ success: true, message: "Followed user." });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
