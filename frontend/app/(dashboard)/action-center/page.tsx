import React from 'react';
import ActionCenterClient from '@/components/action-center/ActionCenterClient';
import { salesService } from '@/lib/server/modules/sales/sales.service';
import { manufacturingService } from '@/lib/server/modules/manufacturing/manufacturing.service';
import { purchaseService } from '@/lib/server/modules/purchase/purchase.service';

export const dynamic = 'force-dynamic';

export default async function ActionCenterPage() {
  let initialSales: any = null;
  let initialMos: any = null;
  let initialPos: any = null;

  try {
    const [sales, mos, pos] = await Promise.all([
      salesService.list(50, 0, 1),
      manufacturingService.list(50, 0, 1),
      purchaseService.list(50, 0, 1),
    ]);

    initialSales = JSON.parse(JSON.stringify(sales));
    initialMos = JSON.parse(JSON.stringify(mos));
    initialPos = JSON.parse(JSON.stringify(pos));
  } catch (err) {
    console.error('Failed to pre-fetch action center data on server:', err);
  }

  return (
    <ActionCenterClient 
      initialSales={initialSales}
      initialMos={initialMos}
      initialPos={initialPos}
    />
  );
}
