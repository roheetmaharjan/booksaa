import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth-session";

const blockedIPs = ["123.45.67.89"];
const validApiKey = process.env.API_KEY;

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";

  if (blockedIPs.includes(ip)) {
    return NextResponse.json({ error: "Blocked IP" }, { status: 403 });
  }

  const apiKey = request.headers.get("x-api-key");

  if (apiKey && apiKey === validApiKey) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  // Not logged in
  if (!session) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('url', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in, trying to access /auth/login
  if (pathname === '/auth/login') {
    const url = request.nextUrl.clone();
    if (session.role === 'ADMIN') url.pathname = '/admin';
    else if (session.role === 'VENDOR') url.pathname = '/business';
    else if (session.role === 'CUSTOMER') url.pathname = '/customer';
    return NextResponse.redirect(url);
  }

  // Role-based protection
  if (pathname.startsWith('/api') && !['ADMIN', 'VENDOR', 'CUSTOMER'].includes(session.role)) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  if (pathname.startsWith('/admin') && session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (pathname.startsWith('/business') && session.role !== 'VENDOR') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (pathname.startsWith('/customer') && session.role !== 'CUSTOMER') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/business',
    '/business/:path*',
    '/customer',
    '/customer/:path*',
    '/api',
    '/api/:path'
  ],
};
