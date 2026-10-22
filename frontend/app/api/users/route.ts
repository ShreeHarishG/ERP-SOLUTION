import { usersService } from '@/lib/server/modules/users/users.service';
import { createUserSchema } from '@/lib/server/modules/users/users.validation';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await requireRole('admin');
    if (isErrorResponse(user)) return user;

    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get('isActive');

    const result = await usersService.list({
      search: searchParams.get('search') ?? undefined,
      role: searchParams.get('role') ?? undefined,
      isActive: isActiveParam !== null ? isActiveParam === 'true' : undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    });

    return jsonSuccess(result, 'Users fetched');
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const actor = await requireRole('admin');
    if (isErrorResponse(actor)) return actor;

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const created = await usersService.create(
      parsed.data,
      actor.sub,
      actor.email,
      actor.role as UserRole,
    );

    return jsonSuccess(created, 'User created', 201);
  });
}
