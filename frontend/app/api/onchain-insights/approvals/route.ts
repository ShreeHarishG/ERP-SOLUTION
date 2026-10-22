// =============================================================================
// Onchain Insights — Human Decision & Approval Queue API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import {
  getApprovalDecisions,
} from '@/lib/mock-data/onchain-insights/approvals';
import { ApprovalFilterParams } from '@/types/onchain-insights';

export async function GET(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase', 'product_manager');
  if (isErrorResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as any;
  const decisionType = searchParams.get('decisionType') as any;
  const urgency = searchParams.get('urgency') as any;
  const search = searchParams.get('search') || undefined;
  const sortBy = searchParams.get('sortBy') as any;
  const sortOrder = searchParams.get('sortOrder') as any;

  const filters: ApprovalFilterParams = {
    status: status || undefined,
    decisionType: decisionType || undefined,
    urgency: urgency || undefined,
    search,
    sortBy,
    sortOrder,
  };

  const response = getApprovalDecisions(filters);

  return NextResponse.json(response);
}
