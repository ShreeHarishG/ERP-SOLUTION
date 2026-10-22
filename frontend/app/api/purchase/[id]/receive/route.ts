import { purchaseService } from '@/lib/server/modules/purchase/purchase.service';
import { receivePurchaseOrderSchema } from '@/lib/server/modules/purchase/purchase.validation';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const actor = await requireRole('admin', 'inventory');
    if (isErrorResponse(actor)) return actor;

    const body = await request.json();
    const parsed = receivePurchaseOrderSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const { id } = await context.params;
    const result = await purchaseService.receiveMaterials(
      id,
      parsed.data,
      actor.sub,
      actor.name,
      actor.role as UserRole
    );

    return jsonSuccess(result, `Purchase order receipt ${parsed.data.checkResult}ed successfully`);
  });
}
