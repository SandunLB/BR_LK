import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow all requests to proceed - we'll handle auth in the layout
  return NextResponse.next();
}