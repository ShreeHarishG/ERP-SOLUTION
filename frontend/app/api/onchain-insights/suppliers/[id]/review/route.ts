// =============================================================================
// Onchain Insights — Supplier Qualification Review Decision API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { getOnboardingSupplierById, reviewOnboardingSupplier } from '@/lib/mock-data/onchain-insights/onboarding';
import type { ReviewDecisionPayload } from '@/types/onchain-insights';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const authResult = await requireRole('admin', 'purchase');
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await context.params;
  const supplier = getOnboardingSupplierById(id);

  if (!supplier) {
    return NextResponse.json({ error: 'Onboarding record not found' }, { status: 404 });
  }

  return NextResponse.json({ data: supplier });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const authResult = await requireRole('admin', 'purchase');
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as Omit<ReviewDecisionPayload, 'supplierId'>;
    const payload: ReviewDecisionPayload = {
      supplierId: id,
      decision: body.decision,
      reviewerName: body.reviewerName || 'Procurement Auditor',
      comments: body.comments || '',
      documentStatusUpdates: body.documentStatusUpdates,
    };

    const updated = reviewOnboardingSupplier(payload);
    if (!updated) {
      return NextResponse.json({ error: 'Onboarding record not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: updated,
      message: `Supplier qualification status updated to ${updated.onboardingStage.toUpperCase()}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to record review decision', details: err?.message },
      { status: 400 }
    );
  }
}
