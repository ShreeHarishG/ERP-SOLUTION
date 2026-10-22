'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  IndianRupee,
  AlertTriangle,
  AlertCircle,
  Layers,
  CheckCircle2,
  TrendingUp,
  Settings,
  RefreshCw,
  Truck,
  Clock,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { productsApi } from '@/services/products.api';
import { inventoryApi } from '@/services/inventory.api';
import type { DashboardStats } from '@/services/dashboard.api';
import type { User } from '@/services/auth.api';
import DashboardHeader from './DashboardHeader';
import DashboardActivityTrail from './DashboardActivityTrail';

interface InventoryDashboardViewProps {
  data: DashboardStats;
  user: User | null;
}

export default function InventoryDashboardView({
  data,
  user,
}: InventoryDashboardViewProps) {
  const queryClient = useQueryClient();
  const { kpis, inventoryHealth, lowStockProducts, recentActivity } = data;

  // Stock Adjustment Form State - isolated strictly to Inventory view
  const [quickAdjProduct, setQuickAdjProduct] = useState('');
  const [quickAdjQty, setQuickAdjQty] = useState(10);
  const [quickAdjNotes, setQuickAdjNotes] = useState('Routine stock audit adjustment');
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);

  // Load products list for adjustment dropdown
  const { data: productsData } = useQuery({
    queryKey: ['inventoryProductsDropdown'],
    queryFn: () => productsApi.list({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const handleQuickAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAdjProduct || quickAdjQty === 0) {
      toast.error('Please select a product and enter a non-zero quantity');
      return;
    }

    setIsAdjustingStock(true);
    try {
      await inventoryApi.adjustStock({
        productId: quickAdjProduct,
        quantity: Number(quickAdjQty),
        notes: quickAdjNotes,
      });
      toast.success('Stock level adjusted successfully!');
      setQuickAdjProduct('');
      setQuickAdjQty(10);
      setQuickAdjNotes('Routine stock audit adjustment');
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock level');
    } finally {
      setIsAdjustingStock(false);
    }
  };

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* Header */}
      <DashboardHeader userRole="inventory" user={user} />

      {/* Inventory KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Total Inventory Assets Value
            </p>
            <p className="text-2xl font-bold text-[#4B164C] tracking-tight">
              ₹{Number(kpis.totalInventoryValue || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp size={12} /> Live Valuation
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#F8E7F6] text-[#4B164C] shrink-0">
            <IndianRupee size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Safety Stock Alerts
            </p>
            <p className="text-2xl font-bold text-rose-600 tracking-tight">
              {kpis.lowStockCount}
            </p>
            <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5">
              <AlertTriangle size={12} /> Below Minimum
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Warehouse Utilisation
            </p>
            <p className="text-2xl font-bold text-text-primary tracking-tight">64.2%</p>
            <p className="text-[10px] text-text-secondary font-semibold">1,240 cu. ft remaining</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <Layers size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Inventory Health Index
            </p>
            <p className="text-2xl font-bold text-emerald-600 tracking-tight">
              {inventoryHealth?.healthy || 0} / {inventoryHealth?.total || 0}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold">Sufficient buffer stock</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Warehouse Space Visualizer & Stock Adjust Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Warehouse Management
              </h3>
              <p className="text-lg font-bold text-text-primary mt-0.5">
                Capacity Allocation Chart
              </p>
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
              Optimal capacity
            </span>
          </div>

          <div className="h-56 w-full flex items-center justify-center bg-slate-50/50 border border-slate-100 rounded-xl p-4 relative">
            <svg viewBox="0 0 200 200" className="w-full h-44">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#e2e8f0" strokeWidth="15" />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#4B164C"
                strokeWidth="15"
                strokeDasharray="502"
                strokeDashoffset="180"
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
              <text x="100" y="95" textAnchor="middle" fill="#4B164C" className="text-2xl font-extrabold font-sans">
                64.2%
              </text>
              <text x="100" y="118" textAnchor="middle" fill="#64748b" className="text-[9px] font-bold uppercase tracking-wider">
                Capacity Used
              </text>
              <text x="100" y="132" textAnchor="middle" fill="#94a3b8" className="text-[8px] font-bold">
                Shiv AP-South
              </text>
            </svg>
            <div className="absolute bottom-4 right-4 flex flex-col gap-1 text-[8px] font-bold text-text-muted bg-white p-2 border border-slate-100 rounded-lg shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-[#4B164C]" /> Timber Storage (42%)
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-amber-500" /> Finished Goods (14%)
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-[#e2e8f0]" /> Empty Space (35.8%)
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stock Adjustment Form */}
        <div className="glass-card p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Inventory Manager Operations
            </h3>
            <p className="text-lg font-bold text-text-primary mt-0.5">Quick Stock Level Adjustment</p>
          </div>
          <form
            onSubmit={handleQuickAdjustSubmit}
            className="space-y-3 bg-slate-50/50 p-4 border border-slate-100 rounded-xl"
          >
            <div className="space-y-1 text-left">
              <label className="block text-[11px] font-bold text-text-secondary uppercase">
                Product Material
              </label>
              <select
                className="input-field py-1.5 px-3 h-9 text-xs"
                value={quickAdjProduct}
                onChange={(e) => setQuickAdjProduct(e.target.value)}
              >
                <option value="">-- Choose Raw Material or Finished Good --</option>
                {productsData?.products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku} | Current: {Number(p.onHandQuantity)} pcs)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3 items-end">
              <div className="space-y-1 text-left col-span-1">
                <label className="block text-[11px] font-bold text-text-secondary uppercase">
                  Delta Quantity
                </label>
                <input
                  type="number"
                  className="input-field py-1.5 px-3 h-9 text-xs"
                  value={quickAdjQty}
                  onChange={(e) => setQuickAdjQty(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1 text-left col-span-2">
                <label className="block text-[11px] font-bold text-text-secondary uppercase">
                  Audit Adjustment Notes
                </label>
                <input
                  type="text"
                  className="input-field py-1.5 px-3 h-9 text-xs"
                  value={quickAdjNotes}
                  onChange={(e) => setQuickAdjNotes(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAdjustingStock}
              className="btn-primary py-1.5 px-4 h-9 text-xs bg-brand-primary hover:bg-brand-hover flex items-center justify-center gap-1 shadow-none w-full mt-1"
            >
              {isAdjustingStock ? <RefreshCw className="animate-spin" size={14} /> : <Settings size={14} />}
              Confirm Stock Adjustment Ledger
            </button>
          </form>
        </div>
      </div>

      {/* Incoming Cargo Tracking for Inventory Managers */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5">
          <Truck size={16} className="text-blue-600" /> Incoming Raw Materials (Purchase Orders in Transit)
        </h3>
        <div className="overflow-x-auto text-xs">
          <table className="erp-table text-left">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier / Vendor</th>
                <th>Product details</th>
                <th>Quantity ordered</th>
                <th>Date Dispatched</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(data as any).inTransitPurchaseOrders && (data as any).inTransitPurchaseOrders.length > 0 ? (
                (data as any).inTransitPurchaseOrders.map((po: any) => {
                  const firstItem = po.items?.[0];
                  const productName = firstItem?.product?.name || 'Unknown';
                  const qty = firstItem
                    ? `${Number(firstItem.quantityOrdered)} ${firstItem.product?.unitOfMeasure || 'pcs'}`
                    : '0 pcs';

                  return (
                    <tr key={po.id}>
                      <td className="font-mono font-bold text-brand-primary">{po.orderNumber}</td>
                      <td className="font-semibold text-text-primary">
                        <div>
                          <span>{po.vendorName}</span>
                          {po.vendorPhone && (
                            <p className="text-[9px] text-text-muted mt-0.5">{po.vendorPhone}</p>
                          )}
                        </div>
                      </td>
                      <td>{productName}</td>
                      <td className="font-bold text-[#4B164C]">{qty}</td>
                      <td>
                        {po.confirmedAt ? format(new Date(po.confirmedAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                      </td>
                      <td>
                        <Badge variant="blue">IN TRANSIT</Badge>
                      </td>
                      <td>
                        <Link
                          href="/procurement"
                          className="text-[10px] font-bold text-brand-primary bg-[#F8E7F6] px-2 py-1 rounded hover:bg-[#F8E7F6]/80 whitespace-nowrap"
                        >
                          Inspect & Verify
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-text-muted">
                    No purchase orders currently in transit.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Stock Alert Board & Inventory Aging */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 space-y-4 lg:col-span-2">
          <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
            <CheckCircle2 size={16} /> Raw Materials Safety Stock Alert Board
          </h3>
          <div className="overflow-x-auto text-xs">
            <table className="erp-table text-left">
              <thead>
                <tr>
                  <th>Raw Material</th>
                  <th>SKU</th>
                  <th>On Hand</th>
                  <th>Safety Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts?.slice(0, 4).map((p) => (
                  <tr key={p.id}>
                    <td className="font-bold text-text-primary">{p.name}</td>
                    <td className="font-mono text-text-secondary">{p.sku}</td>
                    <td className="font-semibold text-rose-600">
                      {p.onHandQuantity} {p.unitOfMeasure}
                    </td>
                    <td>
                      {p.minStockLevel} {p.unitOfMeasure}
                    </td>
                    <td>
                      <Badge variant="red">Critical Low</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5">
            <Clock size={16} /> Inventory Aging Analysis
          </h3>
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="font-semibold text-text-secondary">Fast Moving Stocks (&lt; 15 days)</span>
              <span className="font-bold text-emerald-600">68%</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="font-semibold text-text-secondary">Medium Rotation (15 - 45 days)</span>
              <span className="font-bold text-amber-500">22%</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="font-semibold text-text-secondary">Slow Aging Stocks (&gt; 45 days)</span>
              <span className="font-bold text-rose-500">10%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Trail */}
      <DashboardActivityTrail recentActivity={recentActivity} userRole="inventory" />
    </div>
  );
}
