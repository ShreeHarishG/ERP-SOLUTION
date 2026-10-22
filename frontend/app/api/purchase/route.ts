import { purchaseService } from '@/lib/server/modules/purchase/purchase.service';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';
import type { UserRole } from '@prisma/client';

export async function GET() {
  return handleRoute(async () => {
    const user = await requireRole('admin', 'purchase', 'inventory');
    if (isErrorResponse(user)) return user;

    const orders = await purchaseService.list();
    return jsonSuccess(orders, 'Purchase orders fetched successfully');
  });
}

export async function POST(req: Request) {
  return handleRoute(async () => {
    const user = await requireRole('admin', 'product_manager');
    if (isErrorResponse(user)) return user;

    const payload = await req.json();
    const { productId, quantity } = payload;

    const po = await purchaseService.create(
      { productId, quantity: Number(quantity) },
      user.sub,
      user.name,
      user.role as UserRole
    );

    return jsonSuccess(po, 'Purchase order created successfully', 201);
  });
}

