// =============================================================================
// Onchain Insights — Disruption Signal Detail & Status Workflow API Route
// Next.js 15 App Router dynamic context
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import {
  getMockDisruptionById,
  updateMockDisruptionStatus,
} from '@/lib/mock-data/onchain-insights/disruptions';
import type { DisruptionStatusUpdatePayload } from '@/types/onchain-insights';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const authResult = await requireRole('admin', 'purchase', 'inventory');
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await context.params;
  const signal = getMockDisruptionById(id);

  if (!signal) {
    return NextResponse.json({ error: 'Disruption signal not found' }, { status: 404 });
  }

  return NextResponse.json({ data: signal });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResult = await requireRole('admin', 'purchase', 'inventory');
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as DisruptionStatusUpdatePayload;
    if (!body.status) {
      return NextResponse.json({ error: 'Missing status update field' }, { status: 400 });
    }

    const updated = updateMockDisruptionStatus(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Disruption signal not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: updated,
      message: `Disruption status transitioned to ${body.status.toUpperCase()}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to update disruption status', details: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  return PATCH(request, context);
}
