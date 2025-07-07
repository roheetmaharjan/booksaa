import { NextResponse,NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {isRateLimited} from '@/lib/rate-limit'

const blockedIPs = ['123.45.67.89'];
const validApiKey = process.env.API_KEY;

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  if (blockedIPs.includes(ip)) {
    return NextResponse.json({ error: "Blocked IP" }, { status: 403 });
  }
  const rate = await isRateLimited(ip);
  if (rate.isLimited) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const apiKey = request.headers.get('x-api-key');

  if(apiKey && apiKey === validApiKey){
    return NextResponse.next();
  }
  
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Not logged in
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Already logged in, trying to access /auth/login
  if (pathname === '/auth/login') {
    const url = request.nextUrl.clone();
    if (token.role === 'ADMIN') url.pathname = '/admin';
    else if (token.role === 'VENDOR') url.pathname = '/vendor';
    else if (token.role === 'CUSTOMER') url.pathname = '/customer';
    return NextResponse.redirect(url);
  }

  // Role-based protection
  if (pathname.startsWith('/api') && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (pathname.startsWith('/vendor') && token.role !== 'VENDOR') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (pathname.startsWith('/customer') && token.role !== 'CUSTOMER') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/vendor',
    '/vendor/:path*',
    '/customer',
    '/customer/:path*',
    '/api',
    '/api/:path'
  ],
};
