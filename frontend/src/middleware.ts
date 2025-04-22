import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { commonRoutes, superAdminRoutes } from "./shared/constants/data";
import { Permissions } from "./types/common.types";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const userRole = request.cookies.get("role")?.value;
  const permissions = request.cookies.get("permissions")?.value || "{}";

  const currentPath = request.nextUrl.pathname;
  const currentModule = currentPath.split("/")[1];

  // 🔹 Define protected routes
  const PROTECTED_ROUTES = new Set([
    "dashboard",
    "candidates",
    "questions",
    "users",
    "roles",
    "assessment",
  ]);

  // 🔹 Define public routes
  const PUBLIC_ROUTES = new Set([
    "test"
  ]);
  
  // Skip middleware for public routes
  if (PUBLIC_ROUTES.has(currentModule)) {
    return NextResponse.next();
  }

  // 🔹 Redirect if accessing protected route without authentication
  if (PROTECTED_ROUTES.has(currentModule) && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 🔹 Redirect authenticated users away from login page
  if (currentPath === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 🔹 Parse permissions safely
  let parsedPermissions: Record<string, Permissions> = {};
  try {
    parsedPermissions = JSON.parse(permissions);
  } catch (error) {
    console.error("Failed to parse permissions:", error);
  }

  // 🔹 Allow access if it's a public/common route
  if (commonRoutes.includes(currentModule)) {
    return NextResponse.next();
  }

  // 🔹 Allow access if user has read permissions for the route
  if (parsedPermissions[currentModule]?.can_read) {
    return NextResponse.next();
  }

  // 🔹 Allow access if user is a Super Admin for Super Admin routes
  if (superAdminRoutes.includes(currentModule) && userRole === "Super Admin") {
    return NextResponse.next();
  }

  // 🚫 Redirect unauthorized users
  return NextResponse.redirect(new URL("/unauthorized", request.url));
}

// 🔹 Apply middleware to specific routes
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/candidates/:path*",
    "/questions/:path*",
    "/assessments/:path*",
    "/roles/:path*",
    "/users/:path*",
    "/test/:path*",  // Add test route to matcher but it will be handled by PUBLIC_ROUTES
  ],
};
