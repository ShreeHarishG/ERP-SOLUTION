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

export async function POST(request: Request) {
  return handleRoute(async () => {
    if (process.env.NODE_ENV !== 'development') {
      return jsonError('Not found', 404);
    }

    const body = await request.json();
    const targetEmail = DEMO_ACCOUNTS[body?.role];

    if (!targetEmail) {
      return jsonError('Invalid sandbox role', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
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
      `Switched to ${user.role} role sandbox`,
    );

    return setAuthCookies(response, accessToken, refreshToken, true);
  });
}
