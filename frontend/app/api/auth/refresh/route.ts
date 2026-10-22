import { authService } from '@/lib/server/modules/auth/auth.service';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { getRefreshToken, setAuthCookies } from '@/lib/server/cookies';
import { handleRoute } from '@/lib/server/handle-route';

export async function POST(request: Request) {
  return handleRoute(async () => {
    const cookieToken = await getRefreshToken();
    let bodyToken: string | undefined;

    try {
      const body = await request.json();
      bodyToken = body?.refreshToken;
    } catch {
      // body is optional when refresh_token cookie is present
    }

    const token = cookieToken || bodyToken;
    if (!token) {
      return jsonError('Refresh token missing', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(token);
    const response = jsonSuccess({ ok: true }, 'Token refreshed');
    return setAuthCookies(response, accessToken, newRefreshToken, true);
  });
}
