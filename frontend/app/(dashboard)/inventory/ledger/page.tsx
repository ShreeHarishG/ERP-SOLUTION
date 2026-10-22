import React from 'react';
import InventoryLedgerClient from '@/components/inventory/InventoryLedgerClient';
import { inventoryService } from '@/lib/server/modules/inventory/inventory.service';
import { serializeForClient } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

export default async function InventoryLedgerPage() {
  let initialMovements = null;

  try {
    const rawMovements = await inventoryService.movementsLedger(undefined, 50, 0);
    initialMovements = serializeForClient(rawMovements);
  } catch (err) {
    console.warn('[InventoryLedgerPage SSR] Could not prefetch ledger:', err);
  }

  return <InventoryLedgerClient initialMovements={initialMovements} />;
}
