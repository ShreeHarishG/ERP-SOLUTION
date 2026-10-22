import { bomsService } from '@/lib/server/modules/boms/boms.service';
import { createBomSchema } from '@/lib/server/modules/boms/boms.validation';
import { requireRole, requireAuth, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import { cached, cacheInvalidatePrefix, listCacheKey } from '@/lib/server/cache';
import { parseListParams } from '@/lib/server/paginate';
import type { UserRole } from '@prisma/client';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const params = parseListParams(new URL(request.url));
    const result = await cached(listCacheKey('boms', params.page, params.limit), () =>
      bomsService.list({ limit: params.limit, skip: params.offset, page: params.page }),
    );
    return jsonSuccess(result, 'BOMs fetched successfully');
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const actor = await requireRole('admin', 'product_manager');
    if (isErrorResponse(actor)) return actor;

    const body = await request.json();
    const parsed = createBomSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const bom = await bomsService.create(
      parsed.data,
      actor.sub,
      actor.name,
      actor.role as UserRole,
    );
    await cacheInvalidatePrefix('list:boms');

    return jsonSuccess(bom, 'BOM created successfully', 201);
  });
}
