import { salesService } from '@/lib/server/modules/sales/sales.service';
import { createSalesOrderSchema } from '@/lib/server/modules/sales/sales.validation';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await requireRole('admin', 'sales', 'product_manager', 'purchase', 'inventory');
    if (isErrorResponse(user)) return user;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const skip = (page - 1) * limit;

    const orders = await salesService.list(limit, skip);
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
