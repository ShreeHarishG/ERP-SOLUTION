import React from 'react';
import { inventoryService } from '@/lib/server/modules/inventory/inventory.service';
import InventoryClient from '@/components/inventory/InventoryClient';
import { serializeForClient } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  let initialData = null;
  try {
    const [page, summary] = await Promise.all([
      inventoryService.list(50, 0, 1),
      inventoryService.summary(),
    ]);
    initialData = serializeForClient({ ...page, summary });
  } catch (err) {
    console.warn('[InventoryPage SSR] Could not prefetch inventory:', err);
  }

  return <InventoryClient initialData={initialData} />;
}
