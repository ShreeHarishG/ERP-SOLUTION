import React from 'react';
import { purchaseService } from '@/lib/server/modules/purchase/purchase.service';
import ProcurementClient from '@/components/procurement/ProcurementClient';
import { serializeForClient } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

export default async function ProcurementPage() {
  let initialData = null;
  try {
    const rawData = await purchaseService.list(50, 0, 1);
    initialData = serializeForClient(rawData);
  } catch (err) {
    console.warn('[ProcurementPage SSR] Could not prefetch purchase orders:', err);
  }

  return <ProcurementClient initialData={initialData} />;
}
