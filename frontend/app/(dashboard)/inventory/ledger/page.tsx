'use client';

import { useInventory } from '@/hooks/useInventory';
import { Loader2, ArrowLeft, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import Badge from '@/components/ui/Badge';
import React from 'react';

export default function InventoryLedgerPage() {
  const { useLedger } = useInventory();
  const { data: movements, isLoading, isError } = useLedger();

  const getMovementBadgeVariant = (type: string) => {
    switch (type) {
      case 'stock_adjustment':
        return 'amber';
      case 'stock_reservation':
        return 'purple';
      case 'reservation_release':
        return 'gray';
      case 'purchase_receipt':
        return 'green';
      case 'sales_delivery':
        return 'red';
      case 'manufacturing_consume':
        return 'red';
      case 'manufacturing_produce':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory" className="btn-ghost p-2 rounded-full hover:bg-surface-hover">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title">Stock Ledger (Movements History)</h1>
          <p className="page-subtitle">Immutable audit trail of all warehouse stock movements</p>
        </div>
      </div>

      <div className="glass-card flex flex-col min-h-[500px]">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center items-center h-full min-h-[300px]">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-rose-400">Failed to load stock ledger logs</div>
          ) : !movements || movements.length === 0 ? (
            <div className="p-12 text-center text-text-secondary">No stock movement logs found.</div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Movement Type</th>
                  <th>Quantity Changed</th>
                  <th>Stock Levels</th>
                  <th>Posted By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => {
                  const date = new Date(movement.createdAt);
                  const isPositive = movement.direction > 0;

                  return (
                    <tr key={movement.id}>
                      <td>
                        <span className="flex items-center gap-1.5 text-text-secondary text-xs">
                          <Calendar size={13} className="text-text-muted" />
                          {isNaN(date.getTime()) ? '-' : format(date, 'MMM d, yyyy HH:mm:ss')}
                        </span>
                      </td>
                      <td className="font-medium text-text-primary">{movement.product.name}</td>
                      <td className="font-mono text-xs font-semibold text-text-secondary">{movement.product.sku}</td>
                      <td>
                        <Badge variant={getMovementBadgeVariant(movement.movementType)}>
                          {movement.movementType.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1 font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                          {isPositive ? '+' : '-'}
                          {Number(movement.quantity)} <span className="text-[10px] font-normal text-text-muted">{movement.product.unitOfMeasure}</span>
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-medium text-text-secondary">
                          {Number(movement.quantityBefore)} → <span className="font-bold text-text-primary">{Number(movement.quantityAfter)}</span>
                        </span>
                      </td>
                      <td className="text-text-secondary">{movement.creator?.name || 'System'}</td>
                      <td className="max-w-xs truncate text-text-secondary text-xs" title={movement.notes}>
                        {movement.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
