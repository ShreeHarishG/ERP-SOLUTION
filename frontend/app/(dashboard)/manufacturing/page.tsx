import React from 'react';
import { manufacturingService } from '@/lib/server/modules/manufacturing/manufacturing.service';
import ManufacturingClient from '@/components/manufacturing/ManufacturingClient';
import { serializeForClient } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

export default async function ManufacturingPage() {
  let initialData = null;
  try {
    const rawData = await manufacturingService.list(50, 0, 1);
    initialData = serializeForClient(rawData);
  } catch (err) {
    console.warn('[ManufacturingPage SSR] Could not prefetch manufacturing orders:', err);
  }

  return <ManufacturingClient initialData={initialData} />;
}
