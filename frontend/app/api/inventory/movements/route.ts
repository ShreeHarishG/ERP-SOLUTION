import { inventoryService } from '@/lib/server/modules/inventory/inventory.service';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await requireRole('admin', 'inventory');
    if (isErrorResponse(user)) return user;

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') ?? undefined;

    const ledger = await inventoryService.movementsLedger(productId);
    return jsonSuccess(ledger, 'Inventory movements ledger fetched successfully');
  });
}
