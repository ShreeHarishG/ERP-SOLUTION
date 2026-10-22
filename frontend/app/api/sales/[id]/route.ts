import { salesService } from '@/lib/server/modules/sales/sales.service';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const user = await requireRole('admin', 'sales', 'product_manager', 'purchase', 'inventory');
    if (isErrorResponse(user)) return user;

    const { id } = await context.params;
    const result = await salesService.getById(id);
    return jsonSuccess(result, 'Sales order fetched successfully');
  });
}
