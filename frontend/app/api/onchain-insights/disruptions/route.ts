// =============================================================================
// Onchain Insights — Disruption Signals API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import {
  getMockDisruptions,
  getDisruptionsKpis,
} from '@/lib/mock-data/onchain-insights/disruptions';
import type { DisruptionFilterParams } from '@/types/onchain-insights';

export async function GET(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase', 'inventory');
  if (isErrorResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);

  const filters: DisruptionFilterParams = {
    severity: searchParams.get('severity') || 'all',
    category: searchParams.get('category') || 'all',
    status: searchParams.get('status') || 'all',
    supplierId: searchParams.get('supplierId') || 'all',
    search: searchParams.get('search') || '',
    sortBy: (searchParams.get('sortBy') as any) || 'detectedAt',
    sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
  };

  const disruptions = getMockDisruptions(filters);
  const kpis = getDisruptionsKpis();

  return NextResponse.json({
    data: disruptions.data,
    total: disruptions.total,
    kpis,
  });
}
