import React from 'react';
import TimelineClient from '@/components/timeline/TimelineClient';
import { salesService } from '@/lib/server/modules/sales/sales.service';

export const dynamic = 'force-dynamic';

export default async function BusinessTimelinePage() {
  let initialSales: any = null;

  try {
    const sales = await salesService.list();
    initialSales = JSON.parse(JSON.stringify(sales));
  } catch (err) {
    console.error('Failed to pre-fetch timeline sales on server:', err);
  }

  return <TimelineClient initialData={initialSales} />;
}
