/**
 * Next.js Middleware for TindaGo Admin
 *
 * Handles authentication routing at the middleware level
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // const { pathname } = request.nextUrl; // TODO: Use for server-side auth

  // Public routes that don't require authentication
  // const publicRoutes = [ // TODO: Use for server-side auth
  //   '/auth/login',
  //   '/auth/signup',
  //   '/auth/forgot-password'
  // ];

  // Check if the current path is a public route
  // const isPublicRoute = publicRoutes.includes(pathname); // TODO: Use for server-side auth

  // For now, let the client-side handle authentication
  // This middleware can be extended to handle server-side auth checks
  // if needed in the future

  return NextResponse.next();
}

export const config = {
  // Match all paths except static files and API routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};