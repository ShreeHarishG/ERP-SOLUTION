'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  IndianRupee,
  ShoppingCart,
  AlertTriangle,
  AlertCircle,
  Truck,
  TrendingUp,
  CheckCircle2,
  Plus,
  RefreshCw,
  CheckSquare,
  Square,
  Info,
  ChevronRight,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { salesApi } from '@/services/sales.api';
import { productsApi } from '@/services/products.api';
import type { DashboardStats } from '@/services/dashboard.api';
import type { User } from '@/services/auth.api';
import DashboardHeader from './DashboardHeader';
import DashboardActivityTrail from './DashboardActivityTrail';

interface SalesDashboardViewProps {
  data: DashboardStats;
  user: User | null;
}

export default function SalesDashboardView({ data, user }: SalesDashboardViewProps) {
  const queryClient = useQueryClient();
  const { kpis, recentSalesOrders, recentActivity } = data;

  // --- Inline Quick Create Sales Order State ---
  const [quickSoCustomer, setQuickSoCustomer] = useState('');
  const [quickSoProduct, setQuickSoProduct] = useState('');
  const [quickSoQty, setQuickSoQty] = useState(1);
  const [isCreatingSo, setIsCreatingSo] = useState(false);

  // --- Sales Checklist Tasks ---
  const [salesTasks, setSalesTasks] = useState([
    { id: 1, text: 'Follow up with ABC Furniture on pending quotation confirmation', completed: false },
    { id: 2, text: 'Verify stock reserves for Wooden Chair shipment', completed: true },
    { id: 3, text: 'Submit quarterly sales ledger logs to admin', completed: false },
    { id: 4, text: 'Verify shipping lead times with Logistics Team', completed: false },
  ]);

  // Load products list scoped ONLY to sales quick actions
  const { data: productsData } = useQuery({
    queryKey: ['salesProductsDropdown'],
    queryFn: () => productsApi.list({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const toggleSalesTask = (id: number) => {
    setSalesTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    toast.success('Task status updated');
  };

  const handleQuickSoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSoCustomer || !quickSoProduct || quickSoQty <= 0) {
      toast.error('Please enter customer name, select a product, and enter quantity');
      return;
    }

    const matchedProd = productsData?.products.find((p) => p.id === quickSoProduct);
    if (!matchedProd) {
      toast.error('Invalid product selected');
      return;
    }

    setIsCreatingSo(true);
    try {
      await salesApi.create({
        customerName: quickSoCustomer,
        customerEmail: `${quickSoCustomer.toLowerCase().replace(/\s+/g, '')}@example.com`,
        customerPhone: '+919876543210',
        notes: 'Quick order created from Sales Executive Dashboard',
        items: [
          {
            productId: quickSoProduct,
            quantityOrdered: Number(quickSoQty),
            unitPrice: Number(matchedProd.salesPrice),
          },
        ],
      });
      toast.success('Sales Order created successfully!');
      setQuickSoCustomer('');
      setQuickSoProduct('');
      setQuickSoQty(1);
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create sales order');
    } finally {
      setIsCreatingSo(false);
    }
  };

  const totalRev =
    recentSalesOrders?.reduce((acc: number, o: any) => acc + Number(o.totalAmount || 0), 0) || 0;

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* Header */}
      <DashboardHeader userRole="sales" user={user} />

      {/* Sales KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Today's Sales Revenue
            </p>
            <p className="text-2xl font-bold text-text-primary tracking-tight">
              ₹{Number(totalRev).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp size={12} /> +12.4% vs Yesterday
            </p>
          </div>
          <div className="p-3 rounded-xl bg-pink-50 text-pink-600 shrink-0">
            <IndianRupee size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Active Quotations
            </p>
            <p className="text-2xl font-bold text-text-primary tracking-tight">
              {kpis.totalSalesOrders}
            </p>
            <p className="text-[10px] text-text-muted font-semibold">
              Total sales drafts & active orders
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <ShoppingCart size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Blocked by Shortage
            </p>
            <p className="text-2xl font-bold text-rose-600 tracking-tight">
              {kpis.shortageOrders}
            </p>
            <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5">
              <AlertTriangle size={12} /> Requires PM Action
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Orders Ready for Dispatch
            </p>
            <p className="text-2xl font-bold text-[#4B164C] tracking-tight">
              {Math.max(0, (kpis.pendingSalesOrders || 0) - (kpis.shortageOrders || 0))}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <CheckCircle2 size={12} /> Ready for delivery
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#F8E7F6] text-[#4B164C] shrink-0">
            <Truck size={22} />
          </div>
        </div>
      </div>

      {/* Main Sales Visual & Quick Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Pipeline Funnel SVG */}
        <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Sales Conversion Pipeline
              </h3>
              <p className="text-lg font-bold text-[#4B164C] mt-0.5">
                Lead-to-Order Conversion Funnel
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 text-[9px] font-bold text-text-muted bg-white border border-slate-100 rounded-lg p-1.5 shadow-xs shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#4B164C]" /> Active
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#DD88CF]" /> Negotiation
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#F8E7F6] border border-[#4B164C]" /> Shortage
              </div>
            </div>
          </div>
          <div className="h-56 w-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 p-4">
            <svg viewBox="0 0 400 215" className="w-full h-full max-w-sm overflow-visible">
              <defs>
                <linearGradient id="funnelGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4B164C" />
                  <stop offset="100%" stopColor="#6d246f" />
                </linearGradient>
                <linearGradient id="funnelGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DD88CF" />
                  <stop offset="100%" stopColor="#b551a3" />
                </linearGradient>
              </defs>

              <polygon
                points="10,10 390,10 330,50 70,50"
                fill="url(#funnelGrad1)"
                opacity="0.9"
                className="hover:opacity-100 transition-opacity cursor-pointer duration-200"
              />
              <text
                x="200"
                y="32"
                textAnchor="middle"
                fill="#ffffff"
                className="text-xs font-bold font-sans"
              >
                Leads & Inquiries (120 inquiries)
              </text>

              <polygon
                points="72,54 328,54 278,98 122,98"
                fill="url(#funnelGrad2)"
                opacity="0.85"
                className="hover:opacity-100 transition-opacity cursor-pointer duration-200"
              />
              <text
                x="200"
                y="80"
                textAnchor="middle"
                fill="#ffffff"
                className="text-[11px] font-bold font-sans"
              >
                Quoted Proposals (48 RFQs)
              </text>

              <polygon
                points="124,102 276,102 236,146 164,146"
                fill="#F8E7F6"
                stroke="#4B164C"
                strokeWidth="1"
                className="hover:bg-[#F8E7F6]/90 transition-all cursor-pointer"
              />
              <text
                x="200"
                y="128"
                textAnchor="middle"
                fill="#4B164C"
                className="text-[10px] font-bold font-sans"
              >
                Awaiting PM / Raw Stock (18 SOs)
              </text>

              <polygon
                points="166,150 234,150 214,190 186,190"
                fill="#4B164C"
                className="hover:opacity-90 transition-opacity cursor-pointer duration-200"
              />
              <text
                x="200"
                y="206"
                textAnchor="middle"
                fill="#4B164C"
                className="text-[10px] font-bold font-sans"
              >
                Delivered (12 Completed)
              </text>
            </svg>
          </div>
        </div>

        {/* Quick Create Sales Order Form */}
        <div className="glass-card p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Sales Representative Actions
            </h3>
            <p className="text-lg font-bold text-text-primary mt-0.5">Quick Create Sales Order</p>
          </div>
          <form
            onSubmit={handleQuickSoSubmit}
            className="space-y-3.5 bg-slate-50/50 p-4 border border-slate-100 rounded-xl"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 text-left">
                <label className="block text-[11px] font-bold text-text-secondary uppercase">
                  Customer Name
                </label>
                <input
                  type="text"
                  className="input-field py-1.5 px-3 h-9 text-xs"
                  placeholder="e.g. ABC Furniture"
                  value={quickSoCustomer}
                  onChange={(e) => setQuickSoCustomer(e.target.value)}
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="block text-[11px] font-bold text-text-secondary uppercase">
                  Select Product
                </label>
                <select
                  className="input-field py-1.5 px-3 h-9 text-xs"
                  value={quickSoProduct}
                  onChange={(e) => setQuickSoProduct(e.target.value)}
                >
                  <option value="">-- Choose Item --</option>
                  {productsData?.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (SKU: {p.sku} | Price: ₹{Number(p.salesPrice).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1 text-left">
                <label className="block text-[11px] font-bold text-text-secondary uppercase">
                  Quantity
                </label>
                <input
                  type="number"
                  className="input-field py-1.5 px-3 h-9 text-xs"
                  min="1"
                  value={quickSoQty}
                  onChange={(e) => setQuickSoQty(Number(e.target.value))}
                />
              </div>
              <button
                type="submit"
                disabled={isCreatingSo}
                className="btn-primary py-1.5 px-4 h-9 text-xs bg-brand-primary hover:bg-brand-hover flex items-center justify-center gap-1 shadow-none w-full"
              >
                {isCreatingSo ? <RefreshCw className="animate-spin" size={14} /> : <Plus size={14} />}
                Create Sales Order
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Details Tables (Recent Sales & Follow-ups) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5">
              <ShoppingCart size={16} /> Recent Sales Orders & Traceability
            </h3>
            <Link href="/sales" className="text-xs font-semibold text-brand-primary hover:underline">
              View Sales Book →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="erp-table text-xs">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer Name</th>
                  <th>Status</th>
                  <th className="text-right">Valuation</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSalesOrders?.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link
                        href={`/sales/${order.id}`}
                        className="font-mono font-bold text-brand-primary hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="font-medium text-text-primary">{order.customerName}</td>
                    <td>
                      <Badge
                        variant={
                          order.status === 'shortage_detected'
                            ? 'red'
                            : order.status === 'ready'
                            ? 'amber'
                            : order.status === 'delivered'
                            ? 'green'
                            : 'gray'
                        }
                      >
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="text-right font-bold text-text-primary">
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="text-text-muted">
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5">
            <CheckSquare size={16} /> Follow-Up Tasks
          </h3>
          <div className="space-y-3 mt-2">
            {salesTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-start gap-2.5 p-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors text-xs"
              >
                <button
                  onClick={() => toggleSalesTask(t.id)}
                  className="text-brand-primary hover:scale-105 transition-transform mt-0.5"
                >
                  {t.completed ? (
                    <CheckSquare size={16} className="text-[#4B164C]" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
                <span
                  className={`font-semibold text-text-secondary leading-snug ${
                    t.completed ? 'line-through text-text-muted' : ''
                  }`}
                >
                  {t.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Center Banner */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-brand-accent/20 bg-slate-50">
        <div className="flex items-center gap-3">
          <Info className="text-brand-accent shrink-0 animate-pulse" size={16} />
          <div>
            <p className="font-bold text-xs text-[#4B164C]">Action Center Alerts</p>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Need immediate decision routing? View unified diagnostics for bottlenecks and delay resolutions.
            </p>
          </div>
        </div>
        <Link
          href="/action-center"
          className="text-xs font-bold text-[#4B164C] whitespace-nowrap hover:underline flex items-center gap-0.5 shrink-0"
        >
          Resolve Bottlenecks <ChevronRight size={13} />
        </Link>
      </div>

      {/* Activity Trail */}
      <DashboardActivityTrail recentActivity={recentActivity} userRole="sales" />
    </div>
  );
}
