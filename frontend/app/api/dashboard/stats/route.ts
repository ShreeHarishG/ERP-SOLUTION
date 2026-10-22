import { dashboardService } from '@/lib/server/modules/dashboard/dashboard.service';
import { requireAuth, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

export async function GET() {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const stats = await dashboardService.getStats();
    return jsonSuccess(stats, 'Dashboard stats fetched');
  });
}
