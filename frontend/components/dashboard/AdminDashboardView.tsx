'use client';

import React from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  Hammer,
  AlertTriangle,
  AlertCircle,
  ShoppingCart,
  TrendingUp,
  Clock,
  Sparkles,
  User,
  Info,
  ChevronRight,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { DashboardStats } from '@/services/dashboard.api';
import type { User as UserType } from '@/services/auth.api';
import DashboardHeader from './DashboardHeader';
import DashboardActivityTrail from './DashboardActivityTrail';

interface AdminDashboardViewProps {
  data: DashboardStats;
  user: UserType | null;
}

export default function AdminDashboardView({ data, user }: AdminDashboardViewProps) {
  const { kpis, recentActivity, recentSalesOrders, aiInsights } = data;

  const totalRev =
    recentSalesOrders?.reduce((acc: number, o: any) => acc + Number(o.totalAmount || 0), 0) || 283500;

  // Department scores for radar chart
  const s_sales = aiInsights?.operationalHealthBreakdown?.sales ?? 94;
  const s_pm = aiInsights?.operationalHealthBreakdown?.manufacturing ?? 85;
  const s_proc = aiInsights?.operationalHealthBreakdown?.procurement ?? 68;
  const s_inv = aiInsights?.operationalHealthBreakdown?.inventory ?? 92;
  const s_oee = aiInsights?.operationalHealthBreakdown?.manufacturing ?? 96;
  const s_ful = aiInsights?.operationalHealthBreakdown?.sales ?? 88;

  const r_sales = 80 * (s_sales / 100);
  const r_pm = 80 * (s_pm / 100);
  const r_proc = 80 * (s_proc / 100);
  const r_inv = 80 * (s_inv / 100);
  const r_oee = 80 * (s_oee / 100);
  const r_ful = 80 * (s_ful / 100);

  const pt_sales = `100,${(100 - r_sales).toFixed(1)}`;
  const pt_pm = `${(100 + r_pm * 0.866).toFixed(1)},${(100 - r_pm * 0.5).toFixed(1)}`;
  const pt_proc = `${(100 + r_proc * 0.866).toFixed(1)},${(100 + r_proc * 0.5).toFixed(1)}`;
  const pt_inv = `100,${(100 + r_inv).toFixed(1)}`;
  const pt_oee = `${(100 - r_oee * 0.866).toFixed(1)},${(100 + r_oee * 0.5).toFixed(1)}`;
  const pt_ful = `${(100 - r_ful * 0.866).toFixed(1)},${(100 - r_ful * 0.5).toFixed(1)}`;

  const radarPoints = `${pt_sales} ${pt_pm} ${pt_proc} ${pt_inv} ${pt_oee} ${pt_ful}`;

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* Header */}
      <DashboardHeader userRole="admin" user={user} />

      {/* Admin KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Gross Business Revenue
            </p>
            <p className="text-2xl font-bold text-text-primary tracking-tight">
              ₹{Number(totalRev).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp size={12} /> +14.2% MoM
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <IndianRupee size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Manufacturing Load Runs
            </p>
            <p className="text-2xl font-bold text-text-primary tracking-tight">
              {kpis.runningManufacturingRuns || 0} Runs
            </p>
            <p className="text-[10px] text-text-secondary font-semibold">
              {kpis.pendingManufacturingApprovals || 0} approvals pending
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#F8E7F6] text-[#4B164C] shrink-0">
            <Hammer size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Supply Chain Safety Risk
            </p>
            <p className="text-2xl font-bold text-rose-600 tracking-tight">
              {kpis.lowStockCount} Low Items
            </p>
            <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5">
              <AlertTriangle size={12} /> Critical stock limits
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Customer Order Backlogs
            </p>
            <p className="text-2xl font-bold text-amber-600 tracking-tight">
              {kpis.pendingSalesOrders}
            </p>
            <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
              <Clock size={12} /> Pending Delivery
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <ShoppingCart size={22} />
          </div>
        </div>
      </div>

      {/* AI Insights & Radar Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Business Insights Panel */}
        <div className="glass-card p-5 space-y-4 lg:col-span-2 border border-brand-accent/25 bg-[#F8E7F6]/10 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 bg-brand-primary/[0.03] rounded-bl-full pointer-events-none" />
          <div className="flex justify-between items-center pb-2 border-b border-brand-accent/20">
            <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-2">
              <Sparkles size={16} className="text-brand-accent animate-pulse" />
              AI ERP Corporate Business Insights
            </h3>
            <span className="text-[9px] text-[#4B164C] bg-[#F8E7F6] px-2 py-0.5 rounded font-bold uppercase">
              Generative Analytics Engine
            </span>
          </div>

          <div className="space-y-3.5 text-xs text-text-secondary leading-relaxed">
            <p>
              🤖 <b>CEO Operations Digest:</b>{' '}
              {aiInsights?.executiveSummary ||
                'Corporate metrics are active and stable. Review standard department logs below.'}
            </p>
            {aiInsights?.criticalRisks && aiInsights.criticalRisks.length > 0 ? (
              aiInsights.criticalRisks.slice(0, 1).map((risk: any, index: number) => (
                <div
                  key={index}
                  className={`p-3.5 ${
                    risk.severity.toLowerCase() === 'high'
                      ? 'bg-rose-500/[0.02] border-rose-500/10'
                      : 'bg-amber-500/[0.02] border-amber-500/10'
                  } border rounded-xl space-y-2`}
                >
                  <p className="font-bold text-[#4B164C] flex items-center gap-1.5 text-xs">
                    <AlertTriangle
                      size={14}
                      className={risk.severity.toLowerCase() === 'high' ? 'text-rose-500' : 'text-amber-500'}
                    />{' '}
                    {risk.risk} ({risk.severity} Severity)
                  </p>
                  <p className="text-[11px]">{risk.reason}</p>
                </div>
              ))
            ) : (
              <div className="p-3.5 bg-rose-500/[0.02] border border-rose-500/10 rounded-xl space-y-2">
                <p className="font-bold text-[#4B164C] flex items-center gap-1.5 text-xs">
                  <AlertTriangle size={14} className="text-rose-500" /> Procurement Stockout Warning
                </p>
                <p className="text-[11px]">
                  Current raw wood screw levels are at <b>200 pcs</b>. Based on active manufacturing runs of 80 wooden chairs, we predict a stockout in <b>4 days</b>. Reorder suggestion is <b>1,000 units</b> from <i>Apex Fasteners Corp</i> to avoid assembly floor idle times.
                </p>
              </div>
            )}
            <div className="flex gap-2 pt-1.5">
              <Link
                href="/timeline"
                className="btn-primary py-2 px-4 text-[10px] font-bold bg-[#F8E7F6] text-[#4B164C] hover:bg-[#F8E7F6]/80 shadow-none"
              >
                Trace Sales Order Timeline
              </Link>
              <Link
                href="/audit"
                className="btn-primary py-2 px-4 text-[10px] font-bold bg-brand-primary hover:bg-brand-hover shadow-none"
              >
                Inspect Corporate Audit Log
              </Link>
            </div>
          </div>
        </div>

        {/* Radar Department Scorecard SVG */}
        <div className="glass-card p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Corporate Diagnostics
            </h3>
            <p className="text-lg font-bold text-text-primary mt-0.5">Department Scorecard</p>
          </div>
          <div className="h-48 w-full flex items-center justify-center bg-slate-50/50 border border-slate-100 rounded-xl p-2">
            <svg viewBox="0 0 200 200" className="w-full h-full max-h-40">
              <polygon
                points="100,20 180,60 180,140 100,180 20,140 20,60"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <polygon
                points="100,50 150,75 150,125 100,150 50,125 50,75"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <polygon
                points="100,75 125,87 125,112 100,125 75,112 75,87"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="1"
              />

              <line x1="100" y1="20" x2="100" y2="180" stroke="#cbd5e1" strokeWidth="0.5" />
              <line x1="20" y1="60" x2="180" y2="140" stroke="#cbd5e1" strokeWidth="0.5" />
              <line x1="20" y1="140" x2="180" y2="60" stroke="#cbd5e1" strokeWidth="0.5" />

              <text x="100" y="15" textAnchor="middle" fill="#64748b" className="text-[8px] font-bold font-sans">
                Sales ({s_sales}%)
              </text>
              <text x="190" y="60" textAnchor="start" fill="#64748b" className="text-[8px] font-bold font-sans">
                PM ({s_pm}%)
              </text>
              <text x="190" y="145" textAnchor="start" fill="#64748b" className="text-[8px] font-bold font-sans">
                Procurement ({s_proc}%)
              </text>
              <text x="100" y="195" textAnchor="middle" fill="#64748b" className="text-[8px] font-bold font-sans">
                Inventory ({s_inv}%)
              </text>
              <text x="10" y="145" textAnchor="end" fill="#64748b" className="text-[8px] font-bold font-sans">
                OEE ({s_oee}%)
              </text>
              <text x="10" y="60" textAnchor="end" fill="#64748b" className="text-[8px] font-bold font-sans">
                Fulfillment ({s_ful}%)
              </text>

              <polygon points={radarPoints} fill="rgba(75, 22, 76, 0.2)" stroke="#4B164C" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* User Management and Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 space-y-4 lg:col-span-2">
          <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5">
            <User size={16} /> Corporate Active Users & Activities
          </h3>
          <div className="overflow-x-auto text-xs">
            <table className="erp-table text-left">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email Address</th>
                  <th>Assigned Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold text-text-primary">Super Admin</td>
                  <td>admin@shivfurniture.com</td>
                  <td>
                    <Badge variant="purple">Admin</Badge>
                  </td>
                  <td>
                    <span className="text-emerald-600 font-semibold">Active Session</span>
                  </td>
                </tr>
                <tr>
                  <td className="font-bold text-text-primary">Priya Singh</td>
                  <td>priya@shivfurniture.com</td>
                  <td>
                    <Badge variant="gray">Sales</Badge>
                  </td>
                  <td>
                    <span className="text-emerald-600 font-semibold">Active</span>
                  </td>
                </tr>
                <tr>
                  <td className="font-bold text-text-primary">Ravi Sharma</td>
                  <td>ravi@shivfurniture.com</td>
                  <td>
                    <Badge variant="blue">Product Manager</Badge>
                  </td>
                  <td>
                    <span className="text-emerald-600 font-semibold">Active</span>
                  </td>
                </tr>
                <tr>
                  <td className="font-bold text-text-primary">Amit Patel</td>
                  <td>amit@shivfurniture.com</td>
                  <td>
                    <Badge variant="amber">Purchase</Badge>
                  </td>
                  <td>
                    <span className="text-emerald-600 font-semibold">Active</span>
                  </td>
                </tr>
                <tr>
                  <td className="font-bold text-text-primary">Neha Gupta</td>
                  <td>neha@shivfurniture.com</td>
                  <td>
                    <Badge variant="green">Inventory</Badge>
                  </td>
                  <td>
                    <span className="text-emerald-600 font-semibold">Active</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5">
            <Info size={16} /> Quick Admin Routing
          </h3>
          <div className="space-y-3 text-xs">
            <Link
              href="/users"
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 transition-colors"
            >
              <span className="font-semibold text-text-primary">User Directory & RBAC</span>
              <ChevronRight size={14} className="text-brand-primary" />
            </Link>
            <Link
              href="/audit"
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 transition-colors"
            >
              <span className="font-semibold text-text-primary">Immutable Audit Ledger</span>
              <ChevronRight size={14} className="text-brand-primary" />
            </Link>
            <Link
              href="/settings"
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 transition-colors"
            >
              <span className="font-semibold text-text-primary">Global Enterprise Settings</span>
              <ChevronRight size={14} className="text-brand-primary" />
            </Link>
          </div>
        </div>
      </div>

      {/* Activity Trail */}
      <DashboardActivityTrail recentActivity={recentActivity} userRole="admin" />
    </div>
  );
}
