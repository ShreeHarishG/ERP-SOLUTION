import { bomsService } from '@/lib/server/modules/boms/boms.service';
import { requireAuth, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const quantityStr = searchParams.get('quantity');

    if (!productId || !quantityStr) {
      return jsonError('Missing productId or quantity', 400);
    }

    const quantity = Number(quantityStr);
    if (isNaN(quantity) || quantity <= 0) {
      return jsonError('Quantity must be a positive number', 400);
    }

    const result = await bomsService.explode(productId, quantity);
    return jsonSuccess(result, 'BOM exploded successfully');
  });
}
