import { manufacturingService } from '@/lib/server/modules/manufacturing/manufacturing.service';
import { createManufacturingOrderSchema } from '@/lib/server/modules/manufacturing/manufacturing.validation';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

export async function GET() {
  return handleRoute(async () => {
    const user = await requireRole('admin', 'product_manager', 'sales');
    if (isErrorResponse(user)) return user;

    const orders = await manufacturingService.list();
    return jsonSuccess(orders, 'Manufacturing orders fetched successfully');
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
      actor.role as UserRole
    );

    return jsonSuccess(created, 'Manufacturing request raised successfully', 201);
  });
}
