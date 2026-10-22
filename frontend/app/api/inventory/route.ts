import { inventoryService } from '@/lib/server/modules/inventory/inventory.service';
import { requireAuth, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import { cached, listCacheKey } from '@/lib/server/cache';
import { parseListParams } from '@/lib/server/paginate';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const params = parseListParams(new URL(request.url));
    const [page, summary] = await Promise.all([
      cached(listCacheKey('inventory', params.page, params.limit), () =>
        inventoryService.list(params.limit, params.offset, params.page),
      ),
      params.offset === 0
        ? cached('list:inventory:summary', () => inventoryService.summary(), 30)
        : Promise.resolve(undefined),
    ]);

    return jsonSuccess(
      { ...page, summary },
      'Inventory balances fetched successfully',
    );
  });
}
