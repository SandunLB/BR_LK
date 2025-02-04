import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // If accessing root or /signin, redirect based on path
  if (path === '/') {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Don't redirect if already on a signin page or admin path
  if (path === '/signin' || path.startsWith('/admin')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};