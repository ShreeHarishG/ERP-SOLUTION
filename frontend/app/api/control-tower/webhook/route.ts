// =============================================================================
// Autonomous Control Tower — Unified Webhook Endpoint
// Ingests any agent payload, routes to external webhook or mock, delivers output
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { controlTowerWebhookService } from '@/lib/server/control-tower/webhook-service';
import { UnifiedWebhookRequest } from '@/types/control-tower-agents';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as UnifiedWebhookRequest;

    const result = await controlTowerWebhookService.processWebhook(body);

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
      { status: 400 }
    );
  }
}

export async function GET() {
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
