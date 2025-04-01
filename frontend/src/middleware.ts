import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  
  const token = request.cookies.get("token")?.value;
  const isAuthPage = request.nextUrl.pathname === "/";
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin") || 
                      request.nextUrl.pathname.startsWith("/dashboard") ||
                      request.nextUrl.pathname.startsWith("/candidates") ||
                      request.nextUrl.pathname.startsWith("/questions") ||
                      request.nextUrl.pathname.startsWith("/assessment");

  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}   

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/candidates/:path*',
    '/questions/:path*',
    '/assessment/:path*'
  ]
}; 