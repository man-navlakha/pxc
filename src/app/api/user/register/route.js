import { NextResponse } from "next/server";
import { createSession, createUser, jsonError, setAuthCookies } from "@/server/auth";

export const runtime = "nodejs";

async function readSignupBody(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return request.json();
  }

  const formData = await request.formData();
  return {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  };
}

export async function POST(request) {
  try {
    const body = await readSignupBody(request);
    const user = await createUser({
      username: body.username,
      email: body.email,
      password: body.password,
    });
    const session = await createSession(user.id, request);

    const response = NextResponse.json(
      {
        success: true,
        message: "Signup successful!",
        user,
        username: user.username,
      },
      { status: 201 }
    );
    setAuthCookies(response, session, user);
    return response;
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
