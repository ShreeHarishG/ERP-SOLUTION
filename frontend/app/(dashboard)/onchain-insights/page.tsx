import React from 'react';
import OnchainInsightsClient from '@/components/onchain-insights/OnchainInsightsClient';
import { getMockDashboardData } from '@/lib/mock-data/onchain-insights';

export const dynamic = 'force-dynamic';

export default async function OnchainInsightsPage() {
  let initialData: any = null;

  try {
    const rawData = getMockDashboardData({
      dateRange: '30d',
      riskLevel: 'all',
      supplierId: 'all',
    });
    initialData = JSON.parse(JSON.stringify(rawData));
  } catch (err) {
    console.error('Failed to pre-fetch onchain insights on server:', err);
  }

  return <OnchainInsightsClient initialData={initialData} />;
}
