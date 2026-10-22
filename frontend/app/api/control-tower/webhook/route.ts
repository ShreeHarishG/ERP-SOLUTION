import { NextRequest, NextResponse } from 'next/server';
import { controlTowerWebhookService } from '@/lib/server/control-tower/webhook-service';
import { getCurrentUser, requireAuth, isErrorResponse } from '@/lib/server/auth';
import { verifyHmacSignature } from '@/lib/server/utils/webhook-signature';
import { UnifiedWebhookRequest } from '@/types/control-tower-agents';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const secret = process.env.CONTROL_TOWER_WEBHOOK_SECRET || '';
  const signature =
    request.headers.get('x-control-tower-signature') ||
    request.headers.get('x-webhook-signature');
  const hmacOk = Boolean(secret) && verifyHmacSignature(rawBody, signature, secret);
  const user = await getCurrentUser();

  if (!hmacOk && !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = JSON.parse(rawBody) as UnifiedWebhookRequest;
    const result = await controlTowerWebhookService.processWebhook({
      ...body,
      callback_url: undefined,
    });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'x-control-tower-agent': String(result.agent_id),
        'x-control-tower-mode': result.mode,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process webhook request',
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  }
}

export async function GET() {
  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  const stats = controlTowerWebhookService.getStats();
  const config = controlTowerWebhookService.getConfig();

  return NextResponse.json({
    name: 'Autonomous Supply Chain Control Tower — Unified Webhook Gateway',
    version: '1.0',
    specification: 'October 21, 2026 14-Agent Shared Event Contract',
    active_mode: config.mode,
    stats,
    endpoints: {
      post_webhook: '/api/control-tower/webhook',
      admin_config: '/api/control-tower/config',
    },
    supported_agents: 14,
  });
}
