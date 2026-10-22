'use client';

import React from 'react';
import Badge from '../ui/Badge';
import { Button } from '../ui/Button';
import { Edit3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface InventoryTableProps {
  products: any[];
  onAdjustClick: (product: any) => void;
}

export default function InventoryTable({ products, onAdjustClick }: InventoryTableProps) {
  const { user } = useAuth();
  const canAdjust = user?.role === 'admin' || user?.role === 'inventory';

  return (
    <div className="overflow-x-auto">
      <table className="erp-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Type</th>
            <th className="text-right">On Hand</th>
            <th className="text-right">Reserved</th>
            <th className="text-right">Available Free</th>
            <th>Safety Buffer</th>
            <th>Stock Health</th>
            <th>Days Remaining</th>
            <th>AI Recommendation</th>
            {canAdjust && <th className="text-right pr-6">Action</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const onHand = Number(product.onHandQuantity);
            const reserved = Number(product.reservedQuantity);
            const free = onHand - reserved;
            const min = Number(product.minStockLevel);
            
            // Calculate health and safety percentage
            const isLowStock = free <= min;
            const healthStatus = free === 0 ? 'critical' : isLowStock ? 'warning' : 'healthy';
            
            const bufferPercentage = min > 0 ? Math.min(100, Math.max(0, (free / min) * 100)) : 100;
            
            // Simulated days remaining based on demand
            let daysRemaining = '90+ Days';
            if (free === 0) daysRemaining = '0 Days (Runout)';
            else if (isLowStock) {
              const estimate = Math.max(1, Math.round(free * 1.5));
              daysRemaining = `${estimate} Days Remaining`;
            } else {
              const estimate = Math.min(90, Math.round(free * 2.5));
              daysRemaining = `${estimate} Days Remaining`;
            }

            // AI Recommendation text
            let aiSuggestion = 'Buffer optimal';
            if (free === 0) {
              aiSuggestion = `Reorder ${Number(product.reorderQuantity) || 50} units immediately (Urgent)`;
            } else if (isLowStock) {
              aiSuggestion = `Trigger purchase order for ${Number(product.reorderQuantity) || 50} units`;
            } else if (free < min * 1.5) {
              aiSuggestion = 'Monitor demand variance';
            }

            return (
              <tr key={product.id}>
                <td className="font-mono text-xs font-semibold text-[#4B164C]">{product.sku}</td>
                <td className="font-semibold text-text-primary text-xs">{product.name}</td>
                <td>
                  <Badge variant={product.procurementType === 'manufacture' ? 'purple' : 'blue'}>
                    {product.procurementType === 'manufacture' ? 'Finished Assembly' : 'Raw Material'}
                  </Badge>
                </td>
                <td className="text-right font-medium text-xs">
                  {onHand} <span className="text-[10px] text-text-muted">{product.unitOfMeasure}</span>
                </td>
                <td className="text-right text-text-muted text-xs">
                  {reserved} <span className="text-[10px]">{product.unitOfMeasure}</span>
                </td>
                <td className="text-right">
                  <span className={`font-bold text-xs ${isLowStock ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {free}
                  </span>{' '}
                  <span className="text-[10px] text-text-secondary">{product.unitOfMeasure}</span>
                </td>
                <td>
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          healthStatus === 'critical'
                            ? 'bg-rose-600'
                            : healthStatus === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${bufferPercentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-text-secondary">{Math.round(bufferPercentage)}%</span>
                  </div>
                </td>
                <td>
                  <Badge variant={healthStatus === 'critical' ? 'red' : healthStatus === 'warning' ? 'amber' : 'green'}>
                    {healthStatus}
                  </Badge>
                </td>
                <td className="text-xs font-medium text-text-secondary">{daysRemaining}</td>
                <td>
                  <span className={`text-xs font-medium ${isLowStock ? 'text-rose-600 font-semibold' : 'text-text-secondary'}`}>
                    {aiSuggestion}
                  </span>
                </td>
                {canAdjust && (
                  <td>
                    <div className="flex items-center justify-end pr-4">
                      <Button
                        type="button"
                        variant="secondary"
                        className="px-2.5 py-1 text-[11px] h-7 bg-[#F8E7F6] hover:bg-[#F8E7F6]/80 text-[#4B164C] border-0 rounded-lg shadow-none"
                        onClick={() => onAdjustClick(product)}
                      >
                        <Edit3 size={11} className="mr-1" /> Adjust
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}