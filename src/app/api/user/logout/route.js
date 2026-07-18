import { NextResponse } from "next/server";
import { clearAuthCookies, deleteCurrentSession } from "@/server/auth";

export const runtime = "nodejs";

export async function POST(request) {
  await deleteCurrentSession(request);

  const response = NextResponse.json({
    success: true,
    message: "Logout successful!",
  });
  clearAuthCookies(response);
  return response;
}
