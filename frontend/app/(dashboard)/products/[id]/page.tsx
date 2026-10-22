'use client';

import { useParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import ProductForm from '@/components/forms/ProductForm';
import { Loader2 } from 'lucide-react';
import React from 'react';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const { useGet } = useProducts();
  const { data: product, isLoading, isError } = useGet(id);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full min-h-[300px]">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
      </div>
    );
  }

  if (isError || !product) {
    return <div className="p-8 text-center text-rose-500">Failed to load product or product not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Edit Product: {product.name}</h1>
        <p className="page-subtitle">Update pricing, minimum levels, or details</p>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
