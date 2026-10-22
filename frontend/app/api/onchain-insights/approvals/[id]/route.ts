// =============================================================================
// Onchain Insights — Single Approval Decision & Action API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import {
  getApprovalDecisionById,
  updateApprovalDecision,
} from '@/lib/mock-data/onchain-insights/approvals';
import { ApprovalActionPayload } from '@/types/onchain-insights';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const authResult = await requireRole('admin', 'purchase', 'product_manager');
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await context.params;
  const decision = getApprovalDecisionById(id);

  if (!decision) {
    return NextResponse.json({ error: `Approval item ${id} not found.` }, { status: 404 });
  }

  return NextResponse.json({ data: decision });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResult = await requireRole('admin', 'purchase');
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await context.params;

  try {
    const body: ApprovalActionPayload = await request.json();
    const updated = updateApprovalDecision(id, body);

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Decision ${id} successfully marked as ${updated.status}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update approval decision' },
      { status: 400 }
    );
  }
}
