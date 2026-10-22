import { usersService } from '@/lib/server/modules/users/users.service';
import { updateUserSchema } from '@/lib/server/modules/users/users.validation';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const user = await requireRole('admin');
    if (isErrorResponse(user)) return user;

    const { id } = await context.params;
    const result = await usersService.getById(id);
    return jsonSuccess(result, 'User fetched');
  });
}

export async function PUT(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const actor = await requireRole('admin');
    if (isErrorResponse(actor)) return actor;

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const updated = await usersService.update(
      id,
      parsed.data,
      actor.sub,
      actor.email,
      actor.role as UserRole,
    );

    return jsonSuccess(updated, 'User updated');
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const actor = await requireRole('admin');
    if (isErrorResponse(actor)) return actor;

    const { id } = await context.params;
    const result = await usersService.delete(
      id,
      actor.sub,
      actor.email,
      actor.role as UserRole,
    );

    return jsonSuccess(result, 'User deleted');
  });
}
