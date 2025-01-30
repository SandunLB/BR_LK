import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /admin, etc.)
  const path = request.nextUrl.pathname;

  // If we're accessing the root path, redirect to /signin
  if (path === '/') {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};