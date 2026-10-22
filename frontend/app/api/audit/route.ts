import { auditService } from '@/lib/server/modules/audit/audit.service';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await requireRole('admin');
    if (isErrorResponse(user)) return user;

    const { searchParams } = new URL(request.url);
    const result = await auditService.list({
      userId: searchParams.get('userId') ?? undefined,
      action: searchParams.get('action') ?? undefined,
      entityType: searchParams.get('entityType') ?? undefined,
      startDate: searchParams.get('startDate') ?? undefined,
      endDate: searchParams.get('endDate') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    });

    return jsonSuccess(result, 'Audit logs fetched');
  });
}
