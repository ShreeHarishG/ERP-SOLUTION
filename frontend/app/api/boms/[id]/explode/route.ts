import { bomsService } from '@/lib/server/modules/boms/boms.service';
import { requireAuth, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const quantity = Number(body.quantity ?? 1);

    if (isNaN(quantity) || quantity <= 0) {
      return jsonError('Quantity must be a positive number', 400);
    }

    const bom = await bomsService.getById(id);
    const result = await bomsService.explode(bom.productId, quantity);

    return jsonSuccess(
      {
        bomId: id,
        productId: bom.productId,
        productName: bom.product.name,
        quantity,
        ...result,
      },
      'BOM exploded successfully',
    );
  });
}
