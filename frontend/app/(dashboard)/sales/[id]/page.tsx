import React from 'react';
import { salesService } from '@/lib/server/modules/sales/sales.service';
import SalesOrderDetailClient from '@/components/sales/SalesOrderDetailClient';
import { serializeForClient } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

export default async function SalesOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialOrder = null;

  try {
    const rawOrder = await salesService.getById(id);
    initialOrder = serializeForClient(rawOrder);
  } catch (err) {
    console.warn('[SalesOrderDetailPage SSR] Could not prefetch sales order:', err);
  }

  return <SalesOrderDetailClient id={id} initialOrder={initialOrder} />;
}
