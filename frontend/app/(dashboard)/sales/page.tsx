import React from 'react';
import { salesService } from '@/lib/server/modules/sales/sales.service';
import SalesClient from '@/components/sales/SalesClient';
import { serializeForClient } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  let initialData = null;
  try {
    const rawData = await salesService.list(50, 0, 1);
    initialData = serializeForClient(rawData);
  } catch (err) {
    console.warn('[SalesPage SSR] Could not prefetch sales orders:', err);
  }

  return <SalesClient initialData={initialData} />;
}
