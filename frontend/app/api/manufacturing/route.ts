import { manufacturingService } from '@/lib/server/modules/manufacturing/manufacturing.service';
import { createManufacturingOrderSchema } from '@/lib/server/modules/manufacturing/manufacturing.validation';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import { cached, cacheInvalidatePrefix, listCacheKey } from '@/lib/server/cache';
import { parseListParams } from '@/lib/server/paginate';
import type { UserRole } from '@prisma/client';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await requireRole('admin', 'product_manager', 'sales');
    if (isErrorResponse(user)) return user;

    const params = parseListParams(new URL(request.url));
    const result = await cached(listCacheKey('manufacturing', params.page, params.limit), () =>
      manufacturingService.list(params.limit, params.offset, params.page),
    );
    return jsonSuccess(result, 'Manufacturing orders fetched successfully');
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const actor = await requireRole('admin', 'sales');
    if (isErrorResponse(actor)) return actor;

    const body = await request.json();
    const parsed = createManufacturingOrderSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const created = await manufacturingService.createFromSalesOrder(
      parsed.data.salesOrderId,
      actor.sub,
      actor.name,
      actor.role as UserRole,
    );
    await cacheInvalidatePrefix('list:manufacturing');
    await cacheInvalidatePrefix('dashboard:');

    return jsonSuccess(created, 'Manufacturing request raised successfully', 201);
  });
}
