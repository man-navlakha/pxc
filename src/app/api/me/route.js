import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";

export const runtime = "nodejs";

export async function GET(request) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  return NextResponse.json(user);
}
