import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { commonRoutes, superAdminRoutes } from './shared/constants/data';
import { Permissions } from './types/common.types';
import { getTenantContext } from './lib/tenant-utils';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const currentPath = request.nextUrl.pathname;
  const response = NextResponse.next();

  // Handle root domain (lr-mcq.com or localhost) - public routes
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'lr-mcq.com';
  const isRootDomain = hostname === baseDomain;

  if (isRootDomain) {
    // Allow public routes on root domain
    const PUBLIC_ROOT_ROUTES = new Set(['/', '/signup', '/request-status', '/organization-login']);
    
    if (PUBLIC_ROOT_ROUTES.has(currentPath)) {
      return response;
    }
    
    // Redirect other routes to landing page
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Continue with existing tenant context logic
  const tenantContext = getTenantContext(hostname);

  // Invalid domain - redirect to error page
  if (!tenantContext.isValid) {
    return NextResponse.redirect(new URL('/tenant-not-found?error=INVALID_DOMAIN', request.url));
  }

  // Platform admin routes (admin.lr-mcq.local)
  if (tenantContext.isPlatform) {
    const platformToken = request.cookies.get('platformToken')?.value;
    const currentPath = request.nextUrl.pathname;

    // Allow platform-auth routes without token
    if (currentPath.startsWith('/platform-auth')) {
      // If already authenticated, redirect to platform dashboard
      if (platformToken) {
        return NextResponse.redirect(new URL('/platform/dashboard', request.url));
      }
      return response;
    }

    // Protect platform routes - require platformToken
    if (currentPath.startsWith('/platform')) {
      if (!platformToken) {
        return NextResponse.redirect(new URL('/platform-auth/login', request.url));
      }
      return response;
    }

    // Root path - redirect based on auth status
    if (currentPath === '/' || currentPath === '/login') {
      return NextResponse.redirect(
        new URL(platformToken ? '/platform/dashboard' : '/platform-auth/login', request.url)
      );
    }

    return response;
  }

  // Tenant routes - prevent platform users from accessing
  const platformToken = request.cookies.get('platformToken')?.value;
  if (platformToken) {
    // Platform user trying to access tenant routes - redirect to platform
    return NextResponse.redirect(new URL('https://admin.lr-mcq.local:3000/platform/dashboard'));
  }

  // Frontend extracts tenant from URL directly in axios interceptor
  // Backend validates tenant on API calls

  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('role')?.value;
  const permissions = request.cookies.get('permissions')?.value || '{}';

  // const currentPath = request.nextUrl.pathname;
  const currentModule = currentPath.split('/')[1];

  // 🔹 Block tenant users from accessing platform routes
  if (currentPath.startsWith('/platform') || currentPath.startsWith('/platform-auth')) {
    // Tenant user trying to access platform routes
    if (token) {
      // Authenticated tenant user - redirect to tenant dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Unauthenticated tenant user - redirect to tenant login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 🔹 Define protected routes
  const PROTECTED_ROUTES = new Set([
    'dashboard',
    'candidates',
    'questions',
    'users',
    'roles',
    'assessment',
  ]);

  // 🔹 Define public routes
  const PUBLIC_ROUTES = new Set(['test', 'tenant-not-found', 'login']);

  // Skip middleware for public routes
  if (PUBLIC_ROUTES.has(currentModule)) {
    return response;
  }

  // 🔹 Redirect if accessing protected route without authentication
  if (PROTECTED_ROUTES.has(currentModule) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 🔹 Redirect authenticated users away from login page
  if (currentPath === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 🔹 Parse permissions safely
  let parsedPermissions: Record<string, Permissions> = {};
  try {
    parsedPermissions = JSON.parse(permissions);
  } catch (error) {
    console.error('Failed to parse permissions:', error);
  }

  // 🔹 Allow access if it's a public/common route
  if (commonRoutes.includes(currentModule)) {
    return response;
  }

  // 🔹 Allow access if user has read permissions for the route
  if (parsedPermissions[currentModule]?.can_read) {
    return response;
  }

  // 🔹 Allow access if user is a Super Admin for Super Admin routes
  if (superAdminRoutes.includes(currentModule) && userRole === 'Super Admin') {
    return response;
  }

  // 🚫 Redirect unauthorized users
  return NextResponse.redirect(new URL('/unauthorized', request.url));
}

// 🔹 Apply middleware to specific routes
export const config = {
  matcher: [
    '/',
    '/login',
    '/organization-login',
    '/signup',
    '/request-status',
    '/dashboard/:path*',
    '/candidates/:path*',
    '/questions/:path*',
    '/assessments/:path*',
    '/roles/:path*',
    '/users/:path*',
    '/test/:path*',
    '/platform/:path*',
    '/platform-auth/:path*',
  ],
};
