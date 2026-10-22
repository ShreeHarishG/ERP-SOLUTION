import { purchaseService } from '@/lib/server/modules/purchase/purchase.service';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const actor = await requireRole('admin', 'purchase');
    if (isErrorResponse(actor)) return actor;

    const { id } = await context.params;
    const result = await purchaseService.confirmPO(
      id,
      actor.sub,
      actor.name,
      actor.role as UserRole
    );

    return jsonSuccess(result, 'Purchase order confirmed successfully');
  });
}
