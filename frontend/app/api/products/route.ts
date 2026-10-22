import { productsService } from '@/lib/server/modules/products/products.service';
import { createProductSchema } from '@/lib/server/modules/products/products.validation';
import { requireAuth, requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? undefined;
    const category = searchParams.get('category') ?? undefined;
    const procurementType = searchParams.get('procurementType') ?? undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 5;
    const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined;

    const { cached, listCacheKey } = await import('@/lib/server/cache');
    const result = await cached(
      listCacheKey('products', page, limit, `${search || ''}:${category || ''}:${procurementType || ''}:${offset ?? ''}`),
      () =>
        productsService.list({
          search,
          category,
          procurementType,
          page,
          limit,
          offset,
        }),
      30,
    );

    return jsonSuccess(result, 'Products fetched successfully');
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const actor = await requireRole('admin', 'product_manager');
    if (isErrorResponse(actor)) return actor;

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const created = await productsService.create(
      parsed.data,
      actor.sub,
      actor.name,
      actor.role as UserRole
    );

    return jsonSuccess(created, 'Product created successfully', 201);
  });
}
