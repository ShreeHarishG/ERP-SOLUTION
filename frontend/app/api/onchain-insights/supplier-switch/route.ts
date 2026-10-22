// =============================================================================
// Onchain Insights — Supplier Switching Simulator API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import { calculateSwitchSimulation, DEFAULT_SWITCH_PAIRS } from '@/lib/mock-data/onchain-insights/switching';
import type { SwitchSimulatorParams } from '@/types/onchain-insights';

export async function GET(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase');
  if (isErrorResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const defaultPair = DEFAULT_SWITCH_PAIRS[0];

  const params: SwitchSimulatorParams = {
    currentSupplierId: searchParams.get('current') || defaultPair.currentSupplierId,
    alternativeSupplierId: searchParams.get('alternative') || defaultPair.alternativeSupplierId,
    materialName: searchParams.get('material') || defaultPair.materialName,
    annualVolume: Number(searchParams.get('volume')) || defaultPair.annualVolume,
    currentUnitCost: Number(searchParams.get('currentCost')) || defaultPair.currentUnitCost,
    alternativeUnitCost: Number(searchParams.get('altCost')) || defaultPair.alternativeUnitCost,
    splitRatioCurrent: Number(searchParams.get('split')) || defaultPair.splitRatioCurrent,
    switchingCostOneTime: Number(searchParams.get('switchingCost')) || defaultPair.switchingCostOneTime,
    transitionWeeks: Number(searchParams.get('transitionWeeks')) || defaultPair.transitionWeeks,
  };

  const simulation = calculateSwitchSimulation(params);
  return NextResponse.json({ data: simulation });
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase');
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body = (await request.json()) as SwitchSimulatorParams;
    const simulation = calculateSwitchSimulation(body);
    return NextResponse.json({ data: simulation });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Invalid simulation payload', details: err?.message },
      { status: 400 }
    );
  }
}
