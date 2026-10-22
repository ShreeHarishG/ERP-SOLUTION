import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/server/db';
import { generateAccessToken, generateRefreshToken } from '@/lib/server/utils/jwt';
import { setAuthCookies } from '@/lib/server/cookies';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

const DEMO_ACCOUNTS: Record<string, string> = {
  admin: 'admin@shivfurniture.com',
  sales: 'priya@shivfurniture.com',
  product_manager: 'ravi@shivfurniture.com',
  purchase: 'amit@shivfurniture.com',
  inventory: 'neha@shivfurniture.com',
};

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    // Only permit role sandbox switching in development or non-production
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_ROLE_SWITCHER !== 'true') {
      return jsonError('Role switching is disabled in production environments', 403);
    }

    const body = await request.json();
    const targetRole = body?.role;
    const targetEmail = body?.email || DEMO_ACCOUNTS[targetRole];

    if (!targetEmail) {
      return jsonError('Invalid target role or email for sandbox switch', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      return jsonError('Demo account not found or inactive', 404);
    }

    const jwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    const response = jsonSuccess(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      },
      `Switched to ${user.role} role sandbox`
    );

    return setAuthCookies(response, accessToken, refreshToken, true);
  });
}
