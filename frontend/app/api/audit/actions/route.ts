import { auditService } from '@/lib/server/modules/audit/audit.service';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

export async function GET() {
  return handleRoute(async () => {
    const user = await requireRole('admin');
    if (isErrorResponse(user)) return user;

    const actions = await auditService.getDistinctActions();
    return jsonSuccess(actions, 'Actions fetched');
  });
}
