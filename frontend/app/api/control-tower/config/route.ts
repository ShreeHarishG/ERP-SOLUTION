// =============================================================================
// Autonomous Control Tower — Admin Configuration & Webhook Health Probe
// Stealth Mode: Allows Admin to switch between Single Webhook & Mock Data Mode
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { controlTowerWebhookService } from '@/lib/server/control-tower/webhook-service';
import { getCurrentUser } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  const isAdmin = user?.role === 'admin';

  const config = controlTowerWebhookService.getConfig();
  const stats = controlTowerWebhookService.getStats();

  // If not admin, return sanitized config without sensitive tokens
  if (!isAdmin) {
    return NextResponse.json({
      mode: config.mode,
      hasWebhook: Boolean(config.webhookUrl),
      hasOutgoingCallback: Boolean(config.outgoingCallbackUrl),
      stats,
      isAdmin: false,
    });
  }

  return NextResponse.json({
    ...config,
    stats,
    isAdmin: true,
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (user && user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updated = controlTowerWebhookService.updateConfig(body);

    return NextResponse.json({
      success: true,
      config: updated,
      message: `Control Tower updated to ${updated.mode === 'webhook' ? 'Live Single Webhook' : 'Simulated Mock Engine'} mode.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PUT /api/control-tower/config -> Ping health check
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const pingResult = await controlTowerWebhookService.pingWebhook(body.url);

    return NextResponse.json(pingResult);
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'offline',
        latencyMs: 0,
        httpStatus: 500,
        message: error.message || 'Health check failed',
      },
      { status: 500 }
    );
  }
}
