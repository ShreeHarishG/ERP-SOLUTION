// =============================================================================
// Onchain Insights — Shipments Telemetry & Transit API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { getMockShipments } from '@/lib/mock-data/onchain-insights/disruptions';
import type { ShipmentFilterParams } from '@/types/onchain-insights';

export async function GET(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase', 'inventory');
  if (isErrorResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);

  const filters: ShipmentFilterParams = {
    status: searchParams.get('status') || 'all',
    supplierId: searchParams.get('supplierId') || 'all',
    riskSeverity: searchParams.get('riskSeverity') || 'all',
    search: searchParams.get('search') || '',
  };

  const shipments = getMockShipments(filters);
  return NextResponse.json({ data: shipments.data, total: shipments.total });
}
