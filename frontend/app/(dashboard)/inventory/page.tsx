'use client';

import { useInventory } from '@/hooks/useInventory';
import InventoryTable from '@/components/tables/InventoryTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { History, ShieldAlert, Layers, Landmark, Timer } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Skeleton from '@/components/ui/Skeleton';

export default function InventoryPage() {
  const { useBalances, adjustStock, isAdjusting } = useInventory();
  const { data: products, isLoading, isError } = useBalances();

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<{ quantity: number; notes: string }>({
    defaultValues: {
      quantity: 0,
      notes: 'Manual inventory count adjustment',
    },
  });

  const handleAdjustClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    reset({
      quantity: 0,
      notes: `Stock count adjustment for ${product.name}`,
    });
  };

  const onSubmit = async (data: any) => {
    if (!selectedProduct) return;
    try {
      await adjustStock({
        productId: selectedProduct.id,
        quantity: Number(data.quantity),
        notes: data.notes,
      });
      setIsModalOpen(false);
    } catch {
      // hook handles toast
    }
  };

  // Calculate top metrics from products balances
  const totalValue = products?.reduce((acc, p) => acc + (Number(p.onHandQuantity) * Number(p.costPrice)), 0) || 0;
  const lowStockCount = products
    ? products.filter(p => {
        const free = Number(p.onHandQuantity) - Number(p.reservedQuantity);
        return free <= Number(p.minStockLevel);
      }).length
    : 0;
  const totalReserved = products?.reduce((acc, p) => acc + Number(p.reservedQuantity), 0) || 0;
  const incomingStock = products
    ? (products.filter(p => p.procurementType === 'purchase').length * 25)
    : 150;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="page-title">Inventory Command Center</h1>
          <p className="page-subtitle">Real-time stock ledger levels, allocation commitments, and safety buffers</p>
        </div>
        <Link href="/inventory/ledger" className="btn-secondary text-xs flex items-center gap-1.5 hover:bg-slate-50 border border-surface-border shadow-none">
          <History size={16} />
          <span>View Audit Ledger</span>
        </Link>
      </div>

      {/* KPI Metrics */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-surface-border rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Value</span>
            <span className="text-lg font-bold text-emerald-600 mt-1">₹{Number(totalValue).toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-white border border-surface-border rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Low Stock Items</span>
            <span className={`text-lg font-bold mt-1 ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{lowStockCount}</span>
          </div>
          <div className="bg-white border border-surface-border rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Reserved Qty</span>
            <span className="text-lg font-bold text-text-primary mt-1">{totalReserved} <span className="text-[10px] text-text-muted">pcs</span></span>
          </div>
          <div className="bg-white border border-surface-border rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Incoming stock</span>
            <span className="text-lg font-bold text-blue-600 mt-1">{incomingStock} <span className="text-[10px] text-text-muted font-normal">runs</span></span>
          </div>
          <div className="bg-white border border-surface-border rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Stock Turnover</span>
            <span className="text-lg font-bold text-[#4B164C] mt-1">8.4x <span className="text-[10px] text-emerald-600 font-semibold">(Optimal)</span></span>
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div className="glass-card flex flex-col min-h-[500px]">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-rose-500 font-medium">Failed to load stock levels.</div>
          ) : !products || products.length === 0 ? (
            <div className="p-12 text-center text-text-secondary">No stock balances found. Create products to display.</div>
          ) : (
            <InventoryTable products={products} onAdjustClick={handleAdjustClick} />
          )}
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Adjust Stock: ${selectedProduct?.name || ''}`}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-xs text-text-secondary">
            Current On Hand: <span className="font-bold text-brand-primary">{Number(selectedProduct?.onHandQuantity || 0)} {selectedProduct?.unitOfMeasure}</span>.
            Reserved: <span className="font-bold text-text-muted">{Number(selectedProduct?.reservedQuantity || 0)} {selectedProduct?.unitOfMeasure}</span>.
          </p>

          <Input
            {...register('quantity', { valueAsNumber: true })}
            type="number"
            label="Adjustment Quantity (Use positive to add, negative to subtract)"
            placeholder="e.g. 10 or -5"
            required
          />

          <Input
            {...register('notes')}
            label="Reason for Adjustment"
            placeholder="Stock count, damage, correction..."
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-border mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isAdjusting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isAdjusting}>
              Post Stock Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
