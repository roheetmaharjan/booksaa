import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    if (pathname.startsWith('/auth/login')) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  if(pathname.startsWith('/admin') && token.role !== 'ADMIN'){
    return NextResponse.redirect(new URL('/auth/login',request.url));
  }
  if(pathname.startsWith('/vendor')&& token.role !== 'VENDOR'){
    return NextResponse.redirect(new URL('/auth/login',request.url));
  }
  if (pathname.startsWith('/customer') && token.role !== 'CUSTOMER') {
    return NextResponse.redirect(new URL('', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*','/vendor', '/vendor/:path*', '/customer/:path*'],
};