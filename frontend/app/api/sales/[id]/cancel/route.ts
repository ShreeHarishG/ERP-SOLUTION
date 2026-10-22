import { salesService } from '@/lib/server/modules/sales/sales.service';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleRoute(async () => {
    const actor = await requireRole('admin', 'sales');
    if (isErrorResponse(actor)) return actor;

    const { id } = await params;
    const cancelled = await salesService.cancel(
      id,
      actor.sub,
      actor.name,
      actor.role as UserRole,
    );

    return jsonSuccess(cancelled, 'Sales order cancelled successfully');
  });
}
