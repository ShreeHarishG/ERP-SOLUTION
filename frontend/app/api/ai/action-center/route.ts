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
    
    // Filter recommendations and risks based on roles if not admin
    const userRole = user.role;
    const criticalRisks = insights.criticalRisks.filter((r: any) => 
      userRole === 'admin' || !r.roles || r.roles.includes(userRole)
    );
    const recommendations = insights.recommendations.filter((rec: any) => 
      userRole === 'admin' || !rec.roles || rec.roles.includes(userRole)
    );

    return jsonSuccess(
      { criticalRisks, recommendations },
      'AI Action Center insights fetched successfully'
    );
  });
}
