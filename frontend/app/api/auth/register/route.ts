import { authService } from '@/lib/server/modules/auth/auth.service';
import { registerSchema } from '@/lib/server/modules/auth/auth.validation';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { setAuthCookies } from '@/lib/server/cookies';
import { handleRoute } from '@/lib/server/handle-route';
import { checkRateLimit, getClientIp } from '@/lib/server/rate-limiter';

export async function POST(request: Request) {
  return handleRoute(async () => {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(ip, 5, 15 * 60 * 1000);
    if (!rateLimit.success) {
      return jsonError(
        `Too many registration attempts. Please try again in ${rateLimit.retryAfterSec} seconds.`,
        429
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const result = await authService.register(parsed.data);
    const response = jsonSuccess(
      { user: result.user },
      'Registration successful',
      201,
    );

    return setAuthCookies(response, result.accessToken, result.refreshToken, false);
  });
}
