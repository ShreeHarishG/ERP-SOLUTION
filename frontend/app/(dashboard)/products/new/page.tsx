'use client';

import ProductForm from '@/components/forms/ProductForm';
import React from 'react';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Create New Product</h1>
        <p className="page-subtitle">Add a raw material or finished good to Shiv Furniture Works catalog</p>
      </div>
      <ProductForm />
    </div>
  );
}
