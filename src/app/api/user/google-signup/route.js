import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Google signup is not configured for the new auth system yet.",
    },
    { status: 501 }
  );
}
