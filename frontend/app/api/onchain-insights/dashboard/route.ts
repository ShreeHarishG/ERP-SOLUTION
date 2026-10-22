// =============================================================================
// Onchain Insights — Dashboard API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { getMockDashboardData } from '@/lib/mock-data/onchain-insights';
import type { OnchainDashboardFilters, RiskTier } from '@/types/onchain-insights';

export async function GET(request: NextRequest) {
  // Auth guard — admin and purchase roles
  const authResult = await requireRole('admin', 'purchase');
  if (isErrorResponse(authResult)) return authResult;

  // Parse query params
  const { searchParams } = new URL(request.url);
  const dateRange = (searchParams.get('dateRange') || '30d') as OnchainDashboardFilters['dateRange'];
  const riskLevel = (searchParams.get('riskLevel') || 'all') as RiskTier | 'all';
  const supplierId = searchParams.get('supplierId') || 'all';

  const filters: OnchainDashboardFilters = { dateRange, riskLevel, supplierId };

  // TODO: When ONCHAIN_DATA_MODE=api, call real API instead
  const data = getMockDashboardData(filters);

  return NextResponse.json({ data });
}
