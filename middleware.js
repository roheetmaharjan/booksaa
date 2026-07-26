import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth-session";

const blockedIPs = ["123.45.67.89"];
const validApiKey = process.env.API_KEY;

// Anything with a file extension is a static asset (image, css, js, font,
// etc.) regardless of which folder under /public it lives in. This is the
// key fix: enumerating folder prefixes (/images, /uploads, ...) misses any
// file sitting directly in the public root (e.g. /logo.png), because a
// root-level file doesn't start with any of those prefixes yet still
// matches the `/:slug` matcher pattern below.
const STATIC_FILE = /\.[^/]+$/;

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") || request.ip || "unknown";
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Framework internals, static files anywhere under /public (by extension,
  // not by folder name), and well-known root files.
  if (
    pathname.startsWith("/_next") ||
    STATIC_FILE.test(pathname) ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/manifest.json"
  ) {
    return NextResponse.next();
  }

  // Allow the public marketing homepage
  if (pathname === "/") {
    return NextResponse.next();
  }

  const ip = getClientIp(request);
  if (blockedIPs.includes(ip)) {
    return NextResponse.json({ error: "Blocked IP" }, { status: 403 });
  }

  const apiKey = request.headers.get("x-api-key");
  if (apiKey && apiKey === validApiKey) {
    return NextResponse.next();
  }

  // Allow auth endpoints/pages to run without a session
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  // Not logged in
  if (!session) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("url", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in, trying to access /auth/login
  if (pathname === "/auth/login") {
    const url = request.nextUrl.clone();
    if (session.role === "ADMIN") url.pathname = "/admin";
    else if (session.role === "CUSTOMER") url.pathname = "/customer";
    return NextResponse.redirect(url);
  }

  // Role-based protection
  if (
    pathname.startsWith("/api") &&
    !["ADMIN", "VENDOR", "CUSTOMER"].includes(session.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  if (pathname.startsWith("/customer") && session.role !== "CUSTOMER") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

// export const config = {
//   // Excludes _next/static, _next/image, and any path with a file extension
//   // at the matcher level too — belt-and-suspenders with the STATIC_FILE
//   // check above, so middleware isn't even invoked for asset requests.
//   matcher: [
//     "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|manifest\\.json).*)",
//   ],
// };

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/customer',
    '/customer/:path*',
    '/api',
    '/api/:path'
  ],
};