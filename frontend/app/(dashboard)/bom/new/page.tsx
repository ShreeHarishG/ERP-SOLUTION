'use client';

import BomForm from '@/components/forms/BomForm';
import React from 'react';

export default function NewBomPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Define Bill of Materials (BoM)</h1>
        <p className="page-subtitle">Map ingredients and component quantities to a finished good product</p>
      </div>
      <BomForm />
    </div>
  );
}
