// =============================================================================
// Onchain Insights — Supplier Onboarding API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { getOnboardingSuppliers, createOnboardingSupplier } from '@/lib/mock-data/onchain-insights/onboarding';
import type { OnboardingFormInput, OnboardingStage } from '@/types/onchain-insights';

export async function GET(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase');
  if (isErrorResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const stage = (searchParams.get('stage') || 'all') as OnboardingStage | 'all';

  const list = getOnboardingSuppliers(stage);
  return NextResponse.json({ data: list, total: list.length });
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase');
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body = (await request.json()) as OnboardingFormInput;
    if (!body.name || !body.legalName || !body.contactEmail) {
      return NextResponse.json(
        { error: 'Missing required onboarding fields (name, legalName, contactEmail)' },
        { status: 400 }
      );
    }

    const created = createOnboardingSupplier(body);
    return NextResponse.json(
      { data: created, message: 'Supplier onboarding application submitted successfully.' },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to process onboarding submission', details: err?.message },
      { status: 400 }
    );
  }
}
