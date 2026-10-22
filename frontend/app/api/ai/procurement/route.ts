import { aiEngineService } from '@/lib/server/ai/ai-engine.service';
import { requireAuth, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';

    const insights = await aiEngineService.getInsights(refresh, user.role);
    
    return jsonSuccess(
      { procurementInsights: insights.procurementInsights },
      'AI Procurement insights fetched successfully'
    );
  });
}
