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

    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: targetEmail },
      });
    } catch {
      // Remote DB offline, continue with demo fallback
    }

    const DEMO_NAMES: Record<string, string> = {
      admin: 'Super Admin',
      sales: 'Sales Executive',
      product_manager: 'Product Manager',
      purchase: 'Procurement Mgr',
      inventory: 'Inventory Manager',
    };

    const effectiveUser = user || {
      id: `00000000-0000-0000-0000-00000000000${['admin','sales','product_manager','purchase','inventory'].indexOf(body.role) + 1}`,
      email: targetEmail,
      role: body.role,
      name: DEMO_NAMES[body.role] || 'Demo User',
      isActive: true,
    };

    const jwtPayload = {
      sub: effectiveUser.id,
      email: effectiveUser.email,
      role: effectiveUser.role,
      name: effectiveUser.name,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    const response = jsonSuccess(
      {
        user: {
          id: effectiveUser.id,
          email: effectiveUser.email,
          role: effectiveUser.role,
          name: effectiveUser.name,
        },
      },
      `Switched to ${effectiveUser.role} role sandbox`,
    );

    return setAuthCookies(response, accessToken, refreshToken, true);
  });
}
