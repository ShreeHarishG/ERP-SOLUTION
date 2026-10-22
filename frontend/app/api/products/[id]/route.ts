import { productsService } from '@/lib/server/modules/products/products.service';
import { updateProductSchema } from '@/lib/server/modules/products/products.validation';
import { requireRole, requireAuth, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const { id } = await context.params;
    const result = await productsService.getById(id);
    return jsonSuccess(result, 'Product fetched successfully');
  });
}

export async function PUT(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const actor = await requireRole('admin', 'product_manager');
    if (isErrorResponse(actor)) return actor;

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const updated = await productsService.update(
      id,
      parsed.data,
      actor.sub,
      actor.name,
      actor.role as UserRole
    );

    return jsonSuccess(updated, 'Product updated successfully');
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const actor = await requireRole('admin');
    if (isErrorResponse(actor)) return actor;

    const { id } = await context.params;
    const result = await productsService.delete(
      id,
      actor.sub,
      actor.name,
      actor.role as UserRole
    );

    return jsonSuccess(result, 'Product deleted successfully');
  });
}
