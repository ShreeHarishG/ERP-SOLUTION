'use client';

import SalesOrderForm from '@/components/forms/SalesOrderForm';
import React from 'react';

export default function NewSalesOrderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Create Sales Order</h1>
        <p className="page-subtitle">Create a customer order to check inventory allocation and run shortages explosion</p>
      </div>
      <SalesOrderForm />
    </div>
  );
}
