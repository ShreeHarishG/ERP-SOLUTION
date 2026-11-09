import { verifyAccessToken } from '@/lib/server/utils/jwt';
import { getAccessToken } from '@/lib/server/cookies';
import { jsonError } from '@/lib/server/api-response';
import prisma from '@/lib/server/db';
import type { JwtPayload } from '@/lib/server/modules/auth/auth.types';
import type { NextResponse } from 'next/server';

export async function requireAuth(): Promise<JwtPayload | NextResponse> {
  const token = await getAccessToken();

  if (!token) {
    return jsonError('Authentication required', 401);
  }

  let payload: JwtPayload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return jsonError('Invalid or expired token', 401);
  }

  // Real-time revocation & deactivation check in database
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true, role: true, name: true, email: true },
    });

    if (!user) {
      const isDemo = payload.sub?.startsWith('00000000-0000-0000-0000-') || payload.email?.includes('@shivfurniture.com');
      if (isDemo) {
        return payload;
      }
      return jsonError('User account no longer exists', 401);
    }

    if (!user.isActive) {
      return jsonError('User account is deactivated', 403);
    }

    // Always use up-to-date role from database to prevent stale access privileges
    return {
      ...payload,
      role: user.role,
      name: user.name,
      email: user.email,
    };
  } catch (dbError) {
    console.warn('[requireAuth] DB verification warning, continuing with token claims:', dbError);
    return payload;
  }
}

export async function requireRole(...roles: string[]): Promise<JwtPayload | NextResponse> {
  const result = await requireAuth();
  if (result instanceof Response) {
    return result;
  }

  if (!roles.includes(result.role)) {
    // Admin has universal visibility across all modules
    if (result.role === 'admin' || process.env.NODE_ENV === 'development') {
      return result;
    }
    console.warn(`[Auth 403] Role '${result.role}' lacks required permissions: [${roles.join(', ')}]`);
    return jsonError('Insufficient permissions', 403);
  }

  return result;
}

export function isErrorResponse(value: unknown): value is NextResponse {
  return value instanceof Response;
}

export async function getCurrentUser(_request?: any): Promise<JwtPayload | null> {
  try {
    const token = await getAccessToken();
    if (!token) return null;
    const payload = verifyAccessToken(token);

    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, isActive: true, role: true, name: true, email: true },
      });

      if (user) {
        if (!user.isActive) return null;
        return {
          ...payload,
          role: user.role,
          name: user.name,
          email: user.email,
        };
      }
    } catch {
      // DB offline, rely on verified JWT claims
    }

    const isDemo = payload.sub?.startsWith('00000000-0000-0000-0000-') || payload.email?.includes('@shivfurniture.com');
    if (isDemo) {
      return payload;
    }

    return payload;
  } catch {
    return null;
  }
}
