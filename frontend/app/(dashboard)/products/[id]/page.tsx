import React from 'react';
import { productsService } from '@/lib/server/modules/products/products.service';
import EditProductClient from '@/components/products/EditProductClient';
import { serializeForClient } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialProduct = null;

  try {
    const rawProduct = await productsService.getById(id);
    initialProduct = serializeForClient(rawProduct);
  } catch (err) {
    console.warn('[EditProductPage SSR] Could not prefetch product:', err);
  }

  return <EditProductClient id={id} initialProduct={initialProduct} />;
}
