import { authService } from '@/lib/server/modules/auth/auth.service';
import { requireAuth, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

export async function GET() {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const profile = await authService.getMe(user.sub);
    return jsonSuccess(profile, 'User profile fetched');
  });
}
