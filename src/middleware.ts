import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Skip middleware for API and static files
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Get the access_token from cookies
  const accessToken = request.cookies.get('access_token');

  // Define paths that require authentication
  const protectedPaths = ['/dashboard', '/editor', '/projects'];

  // Check if current path is protected
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Define auth paths where logged-in users shouldn't go (e.g., login, register)
  const isAuthPath = ['/signin', '/signup'].some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !accessToken) {
    // Redirect to signin if accessing a protected route without a token
    const signinUrl = new URL('/signin', request.url);
    // Add the original URL as a redirect parameter if desired
    // signinUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(signinUrl);
  }

  if (isAuthPath && accessToken) {
    // Redirect to dashboard if logged in and trying to access signin/signup
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Apply middleware to all routes except api, _next/static, _next/image, favicon.ico
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
