import { salesService } from '@/lib/server/modules/sales/sales.service';
import { createSalesOrderSchema } from '@/lib/server/modules/sales/sales.validation';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

export async function GET() {
  return handleRoute(async () => {
    const user = await requireRole('admin', 'sales', 'product_manager', 'purchase', 'inventory');
    if (isErrorResponse(user)) return user;

    const orders = await salesService.list();
    return jsonSuccess(orders, 'Sales orders fetched successfully');
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const actor = await requireRole('admin', 'sales');
    console.log('[DEBUG] create sales order actor:', actor);
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
      actor.role as UserRole
    );

    return jsonSuccess(created, 'Sales order created successfully', 201);
  });
}
