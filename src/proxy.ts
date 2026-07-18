import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/user-dashboard', '/admin'];
const authRoutes = ['/login', '/signup'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // For protected routes: if no access token AND no refresh token, redirect to login.
  // If there's a refresh token but no access token, let the page load —
  // the client-side AuthContext will handle the token refresh via POST.
  if (isProtectedRoute && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user has access token and visits login/signup, redirect to dashboard
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/user-dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/user-dashboard/:path*', '/admin/:path*', '/login', '/signup'],
};
