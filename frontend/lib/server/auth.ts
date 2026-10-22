import { verifyAccessToken } from '@/lib/server/utils/jwt';
import { getAccessToken } from '@/lib/server/cookies';
import { jsonError } from '@/lib/server/api-response';
import type { JwtPayload } from '@/lib/server/modules/auth/auth.types';
import type { NextResponse } from 'next/server';

export async function requireAuth(): Promise<JwtPayload | NextResponse> {
  const token = await getAccessToken();

  if (!token) {
    return jsonError('Authentication required', 401);
  }

  try {
    return verifyAccessToken(token);
  } catch {
    return jsonError('Invalid or expired token', 401);
  }
}

export async function requireRole(...roles: string[]): Promise<JwtPayload | NextResponse> {
  const result = await requireAuth();
  if (result instanceof Response) {
    return result;
  }

  if (!roles.includes(result.role)) {
    console.warn(`[Auth 403] Role '${result.role}' lacks required permissions: [${roles.join(', ')}]`);
    return jsonError('Insufficient permissions', 403);
  }

  return result;
}

export function isErrorResponse(value: unknown): value is NextResponse {
  return value instanceof Response;
}
