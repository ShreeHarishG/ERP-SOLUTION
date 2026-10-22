// =============================================================================
// Onchain Insights — Supplier Detail API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { getMockSupplierById } from '@/lib/mock-data/onchain-insights/suppliers';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const authResult = await requireRole('admin', 'purchase');
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await context.params;
  const supplier = getMockSupplierById(id);

  if (!supplier) {
    return NextResponse.json(
      { error: 'Supplier not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: supplier });
}
