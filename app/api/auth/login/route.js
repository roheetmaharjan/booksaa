import { NextResponse } from "next/server";
import {
  authenticateUser,
  AUTH_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const vendor = sessionUser.role === "VENDOR"
      ? await prisma.vendors.findUnique({
          where: { userId: sessionUser.id },
          select: { slug: true },
        })
      : null;

    const redirectTo = sessionUser.role === "ADMIN"
      ? "/admin"
      : sessionUser.role === "VENDOR"
        ? (vendor?.slug ? `/${vendor.slug}` : "/auth/login")
        : sessionUser.role === "CUSTOMER"
          ? "/customer"
          : "/auth/login";

    const response = NextResponse.json({ user: sessionUser, redirectTo });
    response.cookies.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to log in." },
      { status: 400 },
    );
  }
}
