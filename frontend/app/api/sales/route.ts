import { salesService } from '@/lib/server/modules/sales/sales.service';
import { createSalesOrderSchema } from '@/lib/server/modules/sales/sales.validation';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import { cached, listCacheKey } from '@/lib/server/cache';
import { parseListParams } from '@/lib/server/paginate';
import type { UserRole } from '@prisma/client';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await requireRole('admin', 'sales', 'product_manager', 'purchase', 'inventory');
    if (isErrorResponse(user)) return user;

    const params = parseListParams(new URL(request.url));
    const result = await cached(
      listCacheKey('sales', params.page, params.limit),
      () => salesService.list(params.limit, params.offset, params.page),
      45,
    );
    return jsonSuccess(result, 'Sales orders fetched successfully');
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const actor = await requireRole('admin', 'sales');
    if (isErrorResponse(actor)) return actor;

    const body = await request.json();
    const parsed = createSalesOrderSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const created = await salesService.create(
      parsed.data,
      actor.sub,
      actor.name,
      actor.role as UserRole,
    );

    return jsonSuccess(created, 'Sales order created successfully', 201);
  });
}
