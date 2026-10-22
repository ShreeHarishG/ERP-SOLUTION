import { inventoryService } from '@/lib/server/modules/inventory/inventory.service';
import { inventoryReleaseSchema } from '@/lib/server/modules/inventory/inventory.validation';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

export async function POST(request: Request) {
  return handleRoute(async () => {
    const actor = await requireRole('admin', 'inventory', 'sales');
    if (isErrorResponse(actor)) return actor;

    const body = await request.json();
    const parsed = inventoryReleaseSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const result = await inventoryService.releaseStock(
      parsed.data,
      actor.sub,
      actor.name,
      actor.role as UserRole,
    );

    return jsonSuccess(result, 'Stock released successfully', 201);
  });
}
