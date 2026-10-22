import { dashboardService } from '@/lib/server/modules/dashboard/dashboard.service';
import { requireAuth, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const { searchParams } = new URL(request.url);
    const requestedRole = searchParams.get('role');
    const effectiveRole = requestedRole || user.role;

    const stats = await dashboardService.getStats(effectiveRole);
    return jsonSuccess(stats, 'Dashboard stats fetched');
  });
}
