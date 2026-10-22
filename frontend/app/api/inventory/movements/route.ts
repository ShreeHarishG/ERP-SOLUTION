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
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const skip = (page - 1) * limit;

    const ledger = await inventoryService.movementsLedger(productId, limit, skip);
    return jsonSuccess(ledger, 'Inventory movements ledger fetched successfully');
  });
}
