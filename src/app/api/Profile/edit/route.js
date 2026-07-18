import { NextResponse } from "next/server";
import {
  ApiError,
  jsonError,
  normalizeUsername,
  requireUser,
} from "@/server/auth";
import { query } from "@/server/db";

export const runtime = "nodejs";

export async function PUT(request) {
  try {
    const currentUser = await requireUser(request);
    const formData = await request.formData();
    const username = normalizeUsername(formData.get("new_username"));

    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      throw new ApiError(
        400,
        "Username must be 3-32 characters and use only letters, numbers, dots, underscores, or hyphens."
      );
    }

    const result = await query(
      `UPDATE auth_users
       SET username = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING id, username, email, role, profile_pic_url, created_at`,
      [currentUser.id, username]
    );

    const user = result.rows[0];
    const response = NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        ...user,
        profile_pic: user.profile_pic_url || null,
        follower_count: 0,
        following_count: 0,
        post_count: 0,
      },
    });
    response.cookies.set("username", user.username, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
