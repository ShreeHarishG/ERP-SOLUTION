// =============================================================================
// Onchain Insights — Stakeholder Alerts & Notification Center API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isErrorResponse } from '@/lib/server/auth';
import {
  getNotifications,
  updateNotificationStatus,
} from '@/lib/mock-data/onchain-insights/notifications';
import { NotificationFilterParams, NotificationActionPayload } from '@/types/onchain-insights';

export async function GET(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase', 'sales', 'product_manager', 'inventory');
  if (isErrorResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as any;
  const severity = searchParams.get('severity') as any;
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  const search = searchParams.get('search') || undefined;

  const filters: NotificationFilterParams = {
    category: category || undefined,
    severity: severity || undefined,
    unreadOnly,
    search,
  };

  const response = getNotifications(filters);

  return NextResponse.json(response);
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireRole('admin', 'purchase', 'sales', 'product_manager', 'inventory');
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body: NotificationActionPayload = await request.json();
    const result = updateNotificationStatus(body);

    return NextResponse.json({
      success: true,
      unreadCount: result.unreadCount,
      message: 'Notification status updated successfully.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update notifications' },
      { status: 400 }
    );
  }
}
