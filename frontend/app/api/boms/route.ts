import { bomsService } from '@/lib/server/modules/boms/boms.service';
import { createBomSchema } from '@/lib/server/modules/boms/boms.validation';
import { requireRole, requireAuth, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const url = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50', 10), 1), 100);
    const skip = Math.max(parseInt(url.searchParams.get('skip') || '0', 10), 0);

    const boms = await bomsService.list({ limit, skip });
    return jsonSuccess(boms, 'BOMs fetched successfully');
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const actor = await requireRole('admin', 'product_manager');
    if (isErrorResponse(actor)) return actor;

    const body = await request.json();
    const parsed = createBomSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const bom = await bomsService.create(
      parsed.data,
      actor.sub,
      actor.name,
      actor.role as UserRole
    );

    return jsonSuccess(bom, 'BOM created successfully', 201);
  });
}
