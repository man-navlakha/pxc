import { NextResponse } from "next/server";
import {
  createSession,
  jsonError,
  setAuthCookies,
  verifyUserPassword,
} from "@/server/auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const user = await verifyUserPassword(body.username, body.password);
    const session = await createSession(user.id, request);

    const response = NextResponse.json({
      success: true,
      message: "Login successful!",
      user,
      username: user.username,
    });
    setAuthCookies(response, session, user);
    return response;
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
