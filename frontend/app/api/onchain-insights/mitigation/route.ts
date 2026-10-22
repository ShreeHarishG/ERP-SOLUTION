// =============================================================================
// Onchain Insights — Mitigation Recommendation & Scenario Lab API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import {
  getMitigationLabData,
  DEFAULT_MITIGATION_WEIGHTS,
} from '@/lib/mock-data/onchain-insights/mitigation';
import { MitigationLabWeights } from '@/types/onchain-insights';

export async function GET(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase', 'product_manager');
  if (isErrorResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const disruptionId = searchParams.get('disruptionId') || undefined;

  // Custom weights if provided
  const cost = searchParams.get('w_cost');
  const speed = searchParams.get('w_speed');
  const feas = searchParams.get('w_feas');
  const ease = searchParams.get('w_ease');

  const weights: MitigationLabWeights = {
    costEfficiency: cost ? parseFloat(cost) : DEFAULT_MITIGATION_WEIGHTS.costEfficiency,
    recoverySpeed: speed ? parseFloat(speed) : DEFAULT_MITIGATION_WEIGHTS.recoverySpeed,
    feasibility: feas ? parseFloat(feas) : DEFAULT_MITIGATION_WEIGHTS.feasibility,
    operationalEase: ease ? parseFloat(ease) : DEFAULT_MITIGATION_WEIGHTS.operationalEase,
  };

  const data = getMitigationLabData(disruptionId, weights);

  return NextResponse.json({
    data,
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase');
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body = await request.json();
    const { optionId, disruptionId, modifiedAssumptions, comments } = body;

    // Simulate submission to Human Approval queue (Task 10 integration)
    return NextResponse.json({
      success: true,
      message: `Mitigation option ${optionId} submitted for executive approval.`,
      approvalId: `APR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
      details: {
        disruptionId,
        optionId,
        modifiedAssumptions,
        comments,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to process mitigation option submission' },
      { status: 400 }
    );
  }
}
