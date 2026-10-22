'use client';

import { useBom } from '@/hooks/useBom';
import BomForm from '@/components/forms/BomForm';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface EditBomClientProps {
  id: string;
  initialBom?: any;
}

export default function EditBomClient({ id, initialBom }: EditBomClientProps) {
  const { useGet } = useBom();
  const { data: bom, isLoading, isError } = useGet(id, { initialData: initialBom });

  if (isLoading && !initialBom) {
    return (
      <div className="p-8 flex justify-center items-center h-full min-h-[300px]">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
      </div>
    );
  }

  if (isError || !bom) {
    return <div className="p-8 text-center text-rose-500">Failed to load BOM or BOM not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Edit BOM: {bom.name}</h1>
        <p className="page-subtitle">Update components, quantities, or yield details</p>
      </div>
      <BomForm bom={bom} />
    </div>
  );
}
