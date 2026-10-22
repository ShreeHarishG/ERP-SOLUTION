// =============================================================================
// Onchain Insights — SKU Transition Planning API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { calculateSkuTransition, PRECONFIGURED_SKU_PAIRS } from '@/lib/mock-data/onchain-insights/sku-transition';
import type { SkuTransitionParams } from '@/types/onchain-insights';

export async function GET(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase');
  if (isErrorResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const defaultPair = PRECONFIGURED_SKU_PAIRS[0];

  const oldSku = searchParams.get('oldSku') || defaultPair.oldSku;
  const matchedPreset = PRECONFIGURED_SKU_PAIRS.find(p => p.oldSku === oldSku) || defaultPair;

  const params: SkuTransitionParams = {
    oldSku: matchedPreset.oldSku,
    newSku: searchParams.get('newSku') || matchedPreset.newSku,
    productName: searchParams.get('productName') || matchedPreset.productName,
    currentOldInventory: Number(searchParams.get('currentOldInventory')) || matchedPreset.currentOldInventory,
    weeklyDemandRate: Number(searchParams.get('weeklyDemandRate')) || matchedPreset.weeklyDemandRate,
    newSkuLeadTimeWeeks: Number(searchParams.get('newSkuLeadTimeWeeks')) || matchedPreset.newSkuLeadTimeWeeks,
    unitCostOld: Number(searchParams.get('unitCostOld')) || matchedPreset.unitCostOld,
    unitCostNew: Number(searchParams.get('unitCostNew')) || matchedPreset.unitCostNew,
    holdingCostPerUnitYear: Number(searchParams.get('holdingCostPerUnitYear')) || matchedPreset.holdingCostPerUnitYear,
    salvageScrapValuePercent: Number(searchParams.get('salvageScrapValuePercent')) || matchedPreset.salvageScrapValuePercent,
  };

  const result = calculateSkuTransition(params);
  return NextResponse.json({ data: result, presets: PRECONFIGURED_SKU_PAIRS });
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase');
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body = (await request.json()) as SkuTransitionParams;
    const result = calculateSkuTransition(body);
    return NextResponse.json({ data: result });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Invalid SKU transition payload', details: err?.message },
      { status: 400 }
    );
  }
}
