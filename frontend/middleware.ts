import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Static assets & public media files: bypass middleware immediately
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  const payload = accessToken ? decodeJwtPayload(accessToken) : null;
  const isTokenValid = payload && payload.exp ? payload.exp * 1000 > Date.now() : false;
  const hasValidAuth = isTokenValid || Boolean(refreshToken);

  // 1. Auth routes (/login, /register): if already authenticated, redirect to /dashboard
  if (pathname === '/login' || pathname === '/register') {
    if (hasValidAuth) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. Protected routes: dashboard and all operational workspaces
  const isProtectedRoute =
    pathname === '/' ||
    pathname === '/dashboard' ||
    pathname.startsWith('/products') ||
    pathname.startsWith('/sales') ||
    pathname.startsWith('/bom') ||
    pathname.startsWith('/manufacturing') ||
    pathname.startsWith('/procurement') ||
    pathname.startsWith('/vendors') ||
    pathname.startsWith('/inventory') ||
    pathname.startsWith('/onchain-insights') ||
    pathname.startsWith('/timeline') ||
    pathname.startsWith('/action-center') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/audit') ||
    pathname.startsWith('/settings');

  if (isProtectedRoute) {
    if (!hasValidAuth) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based route enforcement at the Edge
    const userRole = payload?.role || '';
    if (userRole && userRole !== 'admin') {
      if (pathname.startsWith('/users') || pathname.startsWith('/audit')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      if (
        (pathname.startsWith('/bom') || pathname.startsWith('/manufacturing')) &&
        userRole !== 'product_manager'
      ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      if (
        pathname.startsWith('/procurement') &&
        !['purchase', 'inventory'].includes(userRole)
      ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      if (pathname.startsWith('/vendors') && userRole !== 'purchase') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      if (pathname.startsWith('/inventory') && userRole !== 'inventory') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      if (pathname.startsWith('/sales') && userRole !== 'sales') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - static files (_next/static, _next/image)
     * - metadata files (favicon.ico, sitemap.xml, robots.txt)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
