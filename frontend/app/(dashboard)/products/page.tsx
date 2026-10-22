import React from 'react';
import { productsService } from '@/lib/server/modules/products/products.service';
import ProductsClient from '@/components/products/ProductsClient';
import { serializeForClient } from '@/lib/server/serialize';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  let initialData = null;
  try {
    const rawData = await productsService.list({ limit: 50, offset: 0 });
    initialData = serializeForClient(rawData);
  } catch (err) {
    console.warn('[ProductsPage SSR] Could not prefetch products:', err);
  }

  return <ProductsClient initialData={initialData} />;
}
