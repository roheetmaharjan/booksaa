import { NextResponse } from "next/server";
import {
  authenticateUser,
  AUTH_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth";

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();
    const sessionUser = await authenticateUser(identifier, password);

    if (!sessionUser) {
      return NextResponse.json(
        { error: "Invalid credentials. Please try again." },
        { status: 401 },
      );
    }

    const token = await createSessionToken(sessionUser);
    const response = NextResponse.json({ user: sessionUser });
    response.cookies.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to log in." },
      { status: 400 },
    );
  }
}
