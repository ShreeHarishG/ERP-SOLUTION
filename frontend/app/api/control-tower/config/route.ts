import { NextRequest, NextResponse } from 'next/server';
import { controlTowerWebhookService } from '@/lib/server/control-tower/webhook-service';
import { requireAuth, requireRole, isErrorResponse } from '@/lib/server/auth';

function publicConfig() {
  const config = controlTowerWebhookService.getConfig();
  const stats = controlTowerWebhookService.getStats();
  return {
    mode: config.mode,
    hasWebhook: Boolean(config.webhookUrl),
    hasOutgoingCallback: Boolean(config.outgoingCallbackUrl),
    simulateLatency: config.simulateLatency,
    lastHealthCheck: config.lastHealthCheck,
    stats,
  };
}

export async function GET() {
  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  return NextResponse.json({
    ...publicConfig(),
    isAdmin: user.role === 'admin',
  });
}

export async function POST(request: NextRequest) {
  const user = await requireRole('admin');
  if (isErrorResponse(user)) return user;

  try {
    const body = await request.json().catch(() => ({}));
    const updated = controlTowerWebhookService.updateConfig({
      mode: body?.mode === 'webhook' ? 'webhook' : 'mock',
    });

    return NextResponse.json({
      success: true,
      config: publicConfig(),
      message: `Control Tower updated to ${updated.mode === 'webhook' ? 'Live Single Webhook' : 'Simulated Mock Engine'} mode.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT() {
  const user = await requireRole('admin');
  if (isErrorResponse(user)) return user;

  try {
    const pingResult = await controlTowerWebhookService.pingWebhook();
    return NextResponse.json(pingResult);
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'offline',
        latencyMs: 0,
        httpStatus: 500,
        message: error.message || 'Health check failed',
      },
      { status: 500 },
    );
  }
}
