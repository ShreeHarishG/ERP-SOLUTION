// =============================================================================
// Onchain Insights — Disruption Prediction & Risk Assessment API Route
// Deterministic rule-based scoring endpoint with customizable weights.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import {
  calculateSupplierRiskAssessments,
  DEFAULT_RISK_WEIGHTS,
} from '@/lib/server/modules/onchain-insights/risk-scoring';
import type {
  RiskAssessmentWeights,
  RiskAssessmentFilterParams,
} from '@/types/onchain-insights';

export async function GET(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase');
  if (isErrorResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);

  const filters: RiskAssessmentFilterParams = {
    tier: searchParams.get('tier') || 'all',
    horizon: searchParams.get('horizon') || '30_days',
    search: searchParams.get('search') || '',
    sortBy: (searchParams.get('sortBy') as any) || 'riskScore',
    sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
  };

  const weights: RiskAssessmentWeights = {
    delivery: searchParams.has('w_delivery')
      ? Number(searchParams.get('w_delivery'))
      : DEFAULT_RISK_WEIGHTS.delivery,
    disruption: searchParams.has('w_disruption')
      ? Number(searchParams.get('w_disruption'))
      : DEFAULT_RISK_WEIGHTS.disruption,
    geographic: searchParams.has('w_geographic')
      ? Number(searchParams.get('w_geographic'))
      : DEFAULT_RISK_WEIGHTS.geographic,
    financial: searchParams.has('w_financial')
      ? Number(searchParams.get('w_financial'))
      : DEFAULT_RISK_WEIGHTS.financial,
    compliance: searchParams.has('w_compliance')
      ? Number(searchParams.get('w_compliance'))
      : DEFAULT_RISK_WEIGHTS.compliance,
  };

  const result = calculateSupplierRiskAssessments(weights, filters);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase');
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body = await request.json();
    const weights: Partial<RiskAssessmentWeights> = body.weights || {};
    const filters: RiskAssessmentFilterParams = body.filters || {};

    const result = calculateSupplierRiskAssessments(weights, filters);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Invalid risk assessment calculation payload', details: err?.message },
      { status: 400 }
    );
  }
}
