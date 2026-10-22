import { auditService } from '@/lib/server/modules/audit/audit.service';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleRoute(async () => {
    const user = await requireRole('admin');
    if (isErrorResponse(user)) return user;

    const { id } = await params;
    const log = await auditService.getById(id);
    return jsonSuccess(log, 'Audit log fetched successfully');
  });
}
