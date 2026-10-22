import { inventoryService } from '@/lib/server/modules/inventory/inventory.service';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';
import { z } from 'zod';

const adjustStockSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  return handleRoute(async () => {
    const actor = await requireRole('admin', 'inventory');
    if (isErrorResponse(actor)) return actor;

    const body = await request.json();
    const parsed = adjustStockSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const result = await inventoryService.adjustStock(
      parsed.data,
      actor.sub,
      actor.name,
      actor.role as UserRole
    );

    return jsonSuccess(result, 'Stock adjusted successfully');
  });
}
