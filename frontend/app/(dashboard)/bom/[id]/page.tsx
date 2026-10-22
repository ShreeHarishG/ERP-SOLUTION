import React from 'react';
import { bomsService } from '@/lib/server/modules/boms/boms.service';
import EditBomClient from '@/components/bom/EditBomClient';
import { serializeForClient } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

export default async function EditBomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialBom = null;

  try {
    const rawBom = await bomsService.getById(id);
    initialBom = serializeForClient(rawBom);
  } catch (err) {
    console.warn('[EditBomPage SSR] Could not prefetch BOM:', err);
  }

  return <EditBomClient id={id} initialBom={initialBom} />;
}
