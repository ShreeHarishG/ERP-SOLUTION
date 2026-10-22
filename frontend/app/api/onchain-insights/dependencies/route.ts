// =============================================================================
// Onchain Insights — Multi-Tier Dependency Graph API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import {
  getMockDependencyGraph,
  traceDownstreamImpact,
} from '@/lib/mock-data/onchain-insights/dependencies';

export async function GET(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase', 'product_manager');
  if (isErrorResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const selectedNode = searchParams.get('selectedNode');

  const graph = getMockDependencyGraph();
  const impact = selectedNode ? traceDownstreamImpact(selectedNode) : traceDownstreamImpact('sup-001');

  return NextResponse.json({
    data: graph,
    impact,
  });
}
