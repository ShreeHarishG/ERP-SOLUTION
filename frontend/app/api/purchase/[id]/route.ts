import { purchaseService } from '@/lib/server/modules/purchase/purchase.service';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const user = await requireRole('admin', 'purchase', 'inventory');
    if (isErrorResponse(user)) return user;

    const { id } = await context.params;
    const result = await purchaseService.getById(id);
    return jsonSuccess(result, 'Purchase order details fetched successfully');
  });
}
