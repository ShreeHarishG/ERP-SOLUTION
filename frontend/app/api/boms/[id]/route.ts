import { bomsService } from '@/lib/server/modules/boms/boms.service';
import { createBomSchema } from '@/lib/server/modules/boms/boms.validation';
import { requireAuth, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const { id } = await context.params;
    const result = await bomsService.getById(id);
    return jsonSuccess(result, 'BOM fetched successfully');
  });
}

export async function PUT(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    if (user.role !== 'admin' && user.role !== 'product_manager') {
      return jsonError('Permission denied', 403);
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = createBomSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const result = await bomsService.update(
      id,
      parsed.data,
      user.sub,
      user.name,
      user.role as UserRole
    );

    return jsonSuccess(result, 'BOM updated successfully');
  });
}

