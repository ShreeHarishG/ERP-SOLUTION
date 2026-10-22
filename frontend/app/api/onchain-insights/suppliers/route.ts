// =============================================================================
// Onchain Insights — Supplier List API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { getMockSuppliers, getSuppliersForComparison } from '@/lib/mock-data/onchain-insights/suppliers';
import type { SupplierFilterParams, RiskTier, QualificationStatus } from '@/types/onchain-insights';

export async function GET(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase');
  if (isErrorResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);

  // If comparison query is requested (e.g. ?compare=sup-001,sup-002)
  const compareParam = searchParams.get('compare');
  if (compareParam) {
    const ids = compareParam.split(',').map(s => s.trim()).filter(Boolean);
    const comparisonData = getSuppliersForComparison(ids);
    return NextResponse.json({ data: comparisonData, total: comparisonData.length });
  }

  const filters: SupplierFilterParams = {
    search: searchParams.get('search') || undefined,
    riskTier: (searchParams.get('riskTier') || 'all') as RiskTier | 'all',
    qualificationStatus: (searchParams.get('qualificationStatus') || 'all') as QualificationStatus | 'all',
    country: searchParams.get('country') || 'all',
    material: searchParams.get('material') || undefined,
    sortBy: (searchParams.get('sortBy') || 'overallScore') as any,
    sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
  };

  const suppliers = getMockSuppliers(filters);

  return NextResponse.json({
    data: suppliers,
    total: suppliers.length,
    filters,
  });
}
