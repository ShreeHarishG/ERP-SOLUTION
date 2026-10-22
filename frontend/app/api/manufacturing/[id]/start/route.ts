import { manufacturingService } from '@/lib/server/modules/manufacturing/manufacturing.service';
import { startManufacturingOrderSchema } from '@/lib/server/modules/manufacturing/manufacturing.validation';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const actor = await requireRole('admin', 'product_manager');
    if (isErrorResponse(actor)) return actor;

    const body = await request.json();
    const parsed = startManufacturingOrderSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const { id } = await context.params;
    const result = await manufacturingService.start(
      id,
      parsed.data.machine,
      actor.sub,
      actor.name,
      actor.role as UserRole
    );

    return jsonSuccess(result, 'Manufacturing order started successfully');
  });
}
