import { authService } from '@/lib/server/modules/auth/auth.service';
import { registerSchema } from '@/lib/server/modules/auth/auth.validation';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { setAuthCookies } from '@/lib/server/cookies';
import { handleRoute } from '@/lib/server/handle-route';

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const result = await authService.register(parsed.data);
    const response = jsonSuccess(
      { user: result.user, accessToken: result.accessToken },
      'Registration successful',
      201,
    );

    return setAuthCookies(response, result.accessToken, result.refreshToken, false);
  });
}
