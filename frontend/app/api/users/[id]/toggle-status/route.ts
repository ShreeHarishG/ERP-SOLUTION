import { usersService } from '@/lib/server/modules/users/users.service';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const actor = await requireRole('admin');
    if (isErrorResponse(actor)) return actor;

    const { id } = await context.params;
    const user = await usersService.toggleStatus(
      id,
      actor.sub,
      actor.email,
      actor.role as UserRole,
    );

    return jsonSuccess(user, `User ${user.isActive ? 'activated' : 'deactivated'}`);
  });
}
