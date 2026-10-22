import { jsonSuccess } from '@/lib/server/api-response';
import { clearAuthCookies } from '@/lib/server/cookies';
import { handleRoute } from '@/lib/server/handle-route';

export async function POST() {
  return handleRoute(async () => {
    const response = jsonSuccess(null, 'Logged out successfully');
    return clearAuthCookies(response);
  });
}
