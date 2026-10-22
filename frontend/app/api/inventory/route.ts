import { inventoryService } from '@/lib/server/modules/inventory/inventory.service';
import { requireAuth, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const result = await inventoryService.list();
    return jsonSuccess(result, 'Inventory balances fetched successfully');
  });
}
