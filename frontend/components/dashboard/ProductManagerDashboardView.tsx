'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Hammer,
  ClipboardList,
  Activity,
  Clock,
  AlertTriangle,
  TrendingUp,
  Layers,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { productsApi } from '@/services/products.api';
import type { DashboardStats } from '@/services/dashboard.api';
import type { User } from '@/services/auth.api';
import DashboardHeader from './DashboardHeader';
import DashboardActivityTrail from './DashboardActivityTrail';

interface ProductManagerDashboardViewProps {
  data: DashboardStats;
  user: User | null;
}

export default function ProductManagerDashboardView({
  data,
  user,
}: ProductManagerDashboardViewProps) {
  const { kpis, recentActivity } = data;

  // Query products specifically for PM stock yield table
  const { data: productsData } = useQuery({
    queryKey: ['pmProductsYield'],
    queryFn: () => productsApi.list({ limit: 10 }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* Header */}
      <DashboardHeader userRole="product_manager" user={user} />

      {/* PM KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Pending PM Approvals
            </p>
            <p className="text-2xl font-bold text-rose-600 tracking-tight">
              {kpis.pendingManufacturingApprovals || 0}
            </p>
            <p className="text-[10px] text-text-secondary font-medium">Production runs in pipeline</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
            <ClipboardList size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Active Shop Floor Runs
            </p>
            <p className="text-2xl font-bold text-text-primary tracking-tight">
              {kpis.runningManufacturingRuns || 0}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp size={12} /> Running on CNCs
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <Hammer size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Overall Equipment Effectiveness
            </p>
            <p className="text-2xl font-bold text-[#4B164C] tracking-tight">
              {kpis.manufacturingEfficiency || '96%'}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold">Average shop floor score</p>
          </div>
          <div className="p-3 rounded-xl bg-[#F8E7F6] text-[#4B164C] shrink-0">
            <Activity size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Delayed MO Runs
            </p>
            <p className="text-2xl font-bold text-amber-600 tracking-tight">
              {kpis.delayedManufacturingCount || 0}
            </p>
            <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
              <AlertTriangle size={12} /> Requires Calibration
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Forecast Chart & PM Workflow Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Manufacturing Scheduling
              </h3>
              <p className="text-lg font-bold text-text-primary mt-0.5">
                Production Demand Forecast (Units)
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              +15.4% Forecast
            </span>
          </div>
          <div className="h-56 w-full bg-slate-50/50 rounded-xl p-3 border border-slate-100 relative">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4B164C" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#F8E7F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="30" y1="20" x2="480" y2="20" stroke="#e2e8f0" strokeDasharray="3,3" />
              <line x1="30" y1="65" x2="480" y2="65" stroke="#e2e8f0" strokeDasharray="3,3" />
              <line x1="30" y1="110" x2="480" y2="110" stroke="#e2e8f0" strokeDasharray="3,3" />
              <line x1="30" y1="155" x2="480" y2="155" stroke="#cbd5e1" strokeWidth="1.5" />

              <path
                d="M 30 155 L 30 110 L 120 70 L 210 90 L 300 45 L 390 30 L 480 15 L 480 155 Z"
                fill="url(#forecastGrad)"
              />
              <path
                d="M 30 110 L 120 70 L 210 90 L 300 45 L 390 30 L 480 15"
                fill="none"
                stroke="#4B164C"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              <circle cx="30" cy="110" r="4.5" fill="#4B164C" stroke="#fff" strokeWidth="1.5" />
              <circle cx="120" cy="70" r="4.5" fill="#4B164C" stroke="#fff" strokeWidth="1.5" />
              <circle cx="210" cy="90" r="4.5" fill="#4B164C" stroke="#fff" strokeWidth="1.5" />
              <circle cx="300" cy="45" r="4.5" fill="#4B164C" stroke="#fff" strokeWidth="1.5" />
              <circle cx="390" cy="30" r="4.5" fill="#4B164C" stroke="#fff" strokeWidth="1.5" />
              <circle cx="480" cy="15" r="4.5" fill="#DD88CF" stroke="#fff" strokeWidth="1.5" />

              <text x="30" y="172" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">
                Week 25
              </text>
              <text x="120" y="172" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">
                Week 26
              </text>
              <text x="210" y="172" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">
                Week 27
              </text>
              <text x="300" y="172" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">
                Week 28
              </text>
              <text x="390" y="172" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">
                Week 29
              </text>
              <text x="480" y="172" textAnchor="middle" fill="#4B164C" className="text-[9px] font-bold">
                Week 30 (Forecast)
              </text>
            </svg>
          </div>
        </div>

        {/* PM Shortcuts */}
        <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              PM Workflow Shortcuts
            </h3>
            <p className="text-lg font-bold text-text-primary mt-0.5">Quick Operations</p>
            <p className="text-xs text-text-secondary mt-1">
              Access primary product management tools, track active factory shop runs, and inspect bill of materials configurations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs mt-2">
            <Link
              href="/bom"
              className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-xl transition-all"
            >
              <div>
                <p className="font-bold text-text-primary">Check Recipes (BOMs)</p>
                <p className="text-[10px] text-text-muted">Manage bill of materials and recipe configurations</p>
              </div>
              <ChevronRight size={16} className="text-brand-primary" />
            </Link>

            <Link
              href="/manufacturing"
              className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-xl transition-all"
            >
              <div>
                <p className="font-bold text-text-primary">Configure Active Shop Run</p>
                <p className="text-[10px] text-text-muted">Monitor and release manufacturing order schedules</p>
              </div>
              <ChevronRight size={16} className="text-brand-primary" />
            </Link>
          </div>
        </div>
      </div>

      {/* Product Lifecycle & Availability Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 space-y-3 lg:col-span-2">
          <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
            <Layers size={16} /> Fast-Moving Products & Stock Yield
          </h3>
          <div className="overflow-x-auto text-xs">
            <table className="erp-table text-left">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>On Hand</th>
                  <th>Reserved</th>
                  <th>Safety Level</th>
                  <th>Strategy</th>
                </tr>
              </thead>
              <tbody>
                {productsData?.products.slice(0, 4).map((p) => (
                  <tr key={p.id}>
                    <td className="font-bold text-text-primary">{p.name}</td>
                    <td className="font-mono text-text-secondary">{p.sku}</td>
                    <td>{Number(p.onHandQuantity)} pcs</td>
                    <td className="text-amber-600 font-bold">{Number(p.reservedQuantity)} reserved</td>
                    <td>{Number(p.minStockLevel)} safety</td>
                    <td>
                      <Badge variant={p.procurementStrategy === 'mts' ? 'green' : 'amber'}>
                        {p.procurementStrategy.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5">
            <CheckCircle2 size={16} /> Product Lifecycle Status
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-1">
              <div className="flex justify-between font-bold text-emerald-800">
                <span>Standard Catalog items</span>
                <span>14 Active</span>
              </div>
              <div className="h-1 bg-emerald-500 rounded-full" style={{ width: '85%' }} />
            </div>
            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg space-y-1">
              <div className="flex justify-between font-bold text-amber-800">
                <span>Prototype Iterations</span>
                <span>2 Custom</span>
              </div>
              <div className="h-1 bg-amber-500 rounded-full" style={{ width: '15%' }} />
            </div>
            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg space-y-1">
              <div className="flex justify-between font-bold text-rose-800">
                <span>Deprecated Recipes</span>
                <span>1 Archive</span>
              </div>
              <div className="h-1 bg-rose-500 rounded-full" style={{ width: '5%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Trail */}
      <DashboardActivityTrail recentActivity={recentActivity} userRole="product_manager" />
    </div>
  );
}
