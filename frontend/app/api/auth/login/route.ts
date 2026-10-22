import { authService } from '@/lib/server/modules/auth/auth.service';
import { loginSchema } from '@/lib/server/modules/auth/auth.validation';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { setAuthCookies } from '@/lib/server/cookies';
import { handleRoute } from '@/lib/server/handle-route';

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const result = await authService.login(parsed.data);
    const response = jsonSuccess(
      { user: result.user, accessToken: result.accessToken },
      'Login successful',
    );

    return setAuthCookies(response, result.accessToken, result.refreshToken, parsed.data.rememberMe);
  });
}
