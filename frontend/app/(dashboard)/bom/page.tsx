import React from 'react';
import { bomsService } from '@/lib/server/modules/boms/boms.service';
import BomClient from '@/components/bom/BomClient';
import { serializeForClient } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

export default async function BomPage() {
  let initialData = null;
  try {
    const rawData = await bomsService.list({ limit: 50, skip: 0, page: 1 });
    initialData = serializeForClient(rawData);
  } catch (err) {
    console.warn('[BomPage SSR] Could not prefetch BOMs:', err);
  }

  return <BomClient initialData={initialData} />;
}
