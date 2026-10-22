'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  AlertTriangle,
  AlertCircle,
  Briefcase,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useVendors } from '@/hooks/useVendors';
import type { DashboardStats } from '@/services/dashboard.api';
import type { User } from '@/services/auth.api';
import DashboardHeader from './DashboardHeader';
import DashboardActivityTrail from './DashboardActivityTrail';

interface ProcurementDashboardViewProps {
  data: DashboardStats;
  user: User | null;
}

export default function ProcurementDashboardView({
  data,
  user,
}: ProcurementDashboardViewProps) {
  const { kpis, recentActivity, smartProcurementRecommendations } = data;

  // Vendors registry hooks - isolated strictly to Procurement view
  const { useList: useVendorsList, createVendor, isCreating: isCreatingVendor } = useVendors();
  const { data: vendorsList } = useVendorsList();

  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName) return;
    try {
      await createVendor({
        name: newVendorName,
        email: newVendorEmail,
        phone: newVendorPhone,
      });
      setNewVendorName('');
      setNewVendorEmail('');
      setNewVendorPhone('');
    } catch {
      // Handled by toast
    }
  };

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* Header */}
      <DashboardHeader userRole="purchase" user={user} />

      {/* Procurement KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Material Shortages Predicted
            </p>
            <p className="text-2xl font-bold text-rose-600 tracking-tight">
              {smartProcurementRecommendations?.length || 0}
            </p>
            <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5">
              <AlertTriangle size={12} /> Stockouts impending
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              AI Buffer Purchase Orders
            </p>
            <p className="text-2xl font-bold text-[#4B164C] tracking-tight">
              {kpis.lowStockCount}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold">Suggested procurement actions</p>
          </div>
          <div className="p-3 rounded-xl bg-[#F8E7F6] text-[#4B164C] shrink-0">
            <Sparkles size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Active POs in Transit
            </p>
            <p className="text-2xl font-bold text-blue-600 tracking-tight">
              {(data as any).inTransitPurchaseOrders?.length || 0}
            </p>
            <p className="text-[10px] text-text-secondary font-semibold">Incoming cargo checks</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Truck size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Supply Chain Portfolio Risk
            </p>
            <p className="text-2xl font-bold text-amber-600 tracking-tight">
              {kpis.procurementRiskScore || 'Low (24%)'}
            </p>
            <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
              <TrendingUp size={12} /> Calculated Risk Score
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <Briefcase size={22} />
          </div>
        </div>
      </div>

      {/* Supplier Lead Times & Smart Procurement Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Procurement Intelligence
              </h3>
              <p className="text-lg font-bold text-text-primary mt-0.5">
                Supplier Lead Time Analytics (Days)
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#4B164C] bg-[#F8E7F6] px-2 py-0.5 rounded border border-brand-accent/20">
              Global Timber Preferred
            </span>
          </div>
          <div className="h-56 w-full bg-slate-50/50 rounded-xl p-3 border border-slate-100 relative">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              <line x1="30" y1="20" x2="480" y2="20" stroke="#e2e8f0" strokeDasharray="3,3" />
              <line x1="30" y1="65" x2="480" y2="65" stroke="#e2e8f0" strokeDasharray="3,3" />
              <line x1="30" y1="110" x2="480" y2="110" stroke="#e2e8f0" strokeDasharray="3,3" />
              <line x1="30" y1="150" x2="480" y2="150" stroke="#cbd5e1" />

              <rect x="55" y="65" width="30" height="85" rx="3" fill="#4B164C" />
              <text x="70" y="55" textAnchor="middle" fill="#4B164C" className="text-[10px] font-bold">
                5 Days
              </text>
              <text x="70" y="165" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">
                Vendor A (Apex)
              </text>

              <rect x="185" y="110" width="30" height="40" rx="3" fill="#DD88CF" />
              <text x="200" y="100" textAnchor="middle" fill="#DD88CF" className="text-[10px] font-bold">
                2 Days
              </text>
              <text x="200" y="165" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">
                Vendor B (Global)
              </text>

              <rect x="315" y="30" width="30" height="120" rx="3" fill="#94a3b8" opacity="0.6" />
              <text x="330" y="20" textAnchor="middle" fill="#64748b" className="text-[10px] font-bold">
                8 Days
              </text>
              <text x="330" y="165" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">
                Vendor C (Rainbow)
              </text>

              <line x1="30" y1="80" x2="480" y2="80" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="440" y="74" fill="#ef4444" className="text-[8px] font-bold">
                SLA Target (4.5d)
              </text>
            </svg>
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-2">
              <Sparkles size={16} className="text-brand-accent animate-pulse" />
              AI Procurement Recommendations
            </h3>
            <span className="text-[9px] text-text-muted font-semibold uppercase">
              Predictive Stockout buffers
            </span>
          </div>
          <div className="space-y-3">
            {smartProcurementRecommendations && smartProcurementRecommendations.length > 0 ? (
              smartProcurementRecommendations.slice(0, 2).map((rec: any) => (
                <div
                  key={rec.sku}
                  className="p-3.5 border border-brand-accent/20 bg-[#F8E7F6]/15 rounded-xl space-y-2 relative overflow-hidden text-xs"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded">
                      Stockout in {rec.daysRemaining} Days
                    </span>
                    <Badge variant={rec.riskScore === 'High' ? 'red' : 'amber'}>
                      {rec.riskScore} Risk
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">{rec.name}</h4>
                    <p className="text-[10px] text-text-muted">
                      SKU: {rec.sku} | Consumption: {rec.consumption}/day
                    </p>
                  </div>
                  <div className="text-[10px] text-text-secondary bg-white p-2 border border-slate-100 rounded-lg space-y-1 font-semibold">
                    <div className="flex justify-between">
                      <span>Current Stock:</span>{' '}
                      <span className="text-text-primary">{rec.currentStock} pcs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Suggested PO size:</span>{' '}
                      <span className="text-emerald-600 font-bold">{rec.suggestedOrder} Units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preferred Vendor:</span>{' '}
                      <span className="text-[#4B164C]">{rec.preferredVendor}</span>
                    </div>
                  </div>
                  <Link
                    href="/procurement"
                    className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-0.5 pt-1"
                  >
                    Initiate Reorder PO <ArrowRight size={10} />
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted">No pending smart procurement suggestions.</p>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Orders and Vendor Registry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#4B164C]">Open Purchase Requests & RFQs</h3>
            <Link href="/procurement" className="text-xs font-semibold text-brand-primary hover:underline">
              Procurement Workspace →
            </Link>
          </div>
          <div className="overflow-x-auto text-xs">
            <table className="erp-table text-left">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Items & Quantities Requested</th>
                  <th>Status</th>
                  <th>Requested By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(data as any).pendingPurchaseOrders && (data as any).pendingPurchaseOrders.length > 0 ? (
                  (data as any).pendingPurchaseOrders.map((po: any) => (
                    <tr key={po.id} className="align-middle">
                      <td className="p-4 font-mono font-bold text-brand-primary text-xs">
                        {po.orderNumber}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 max-w-md">
                          {po.items?.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center bg-[#F8E7F6]/10 border border-brand-accent/15 rounded-lg p-2 font-medium text-xs text-text-primary"
                            >
                              <div className="flex flex-col">
                                <span className="font-bold">{item.product?.name}</span>
                                <span className="text-[10px] text-text-muted font-mono">
                                  SKU: {item.product?.sku}
                                </span>
                              </div>
                              <span className="font-extrabold text-[#4B164C] bg-[#F8E7F6] px-2 py-0.5 rounded text-[11px] whitespace-nowrap ml-4">
                                {Number(item.quantityOrdered)} {item.product?.unitOfMeasure}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            po.vendorName === 'Recommended Vendor (Pending Quote)'
                              ? 'gray'
                              : po.vendorName === 'RFQ Sent (Pending Bids)'
                              ? 'purple'
                              : 'blue'
                          }
                        >
                          {po.vendorName === 'Recommended Vendor (Pending Quote)'
                            ? 'PENDING VERIFICATION'
                            : po.vendorName === 'RFQ Sent (Pending Bids)'
                            ? 'RFQ SENT'
                            : 'PO DRAFT'}
                        </Badge>
                      </td>
                      <td className="p-4 font-medium text-text-secondary">{po.creator?.name || 'System'}</td>
                      <td className="p-4">
                        <Link
                          href="/procurement"
                          className="text-[10px] font-bold text-white bg-[#4B164C] hover:bg-[#381039] px-2.5 py-1.5 rounded-lg transition-colors inline-block whitespace-nowrap"
                        >
                          {po.vendorName === 'Recommended Vendor (Pending Quote)'
                            ? 'Verify & Request'
                            : 'Compare Quotes'}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-text-muted">
                      No pending raw material purchase requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendor Directory Widget */}
        <div className="glass-card p-5 space-y-4 lg:col-span-1">
          <h3 className="font-bold text-sm text-[#4B164C]">Vendor Directory</h3>

          <form
            onSubmit={handleAddVendor}
            className="space-y-2 p-3 bg-slate-50 border border-surface-border rounded-xl"
          >
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Register Vendor Partner
            </p>
            <input
              type="text"
              placeholder="Vendor Name *"
              value={newVendorName}
              onChange={(e) => setNewVendorName(e.target.value)}
              className="input-field py-1 px-2.5 h-8 text-[11px] focus:bg-white"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="email"
                placeholder="Email Address"
                value={newVendorEmail}
                onChange={(e) => setNewVendorEmail(e.target.value)}
                className="input-field py-1 px-2.5 h-8 text-[11px] focus:bg-white"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newVendorPhone}
                onChange={(e) => setNewVendorPhone(e.target.value)}
                className="input-field py-1 px-2.5 h-8 text-[11px] focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isCreatingVendor}
              className="w-full h-8 text-xs font-semibold bg-[#4B164C] hover:bg-[#381039] text-white rounded-lg transition-colors flex items-center justify-center"
            >
              {isCreatingVendor ? 'Adding...' : 'Add Vendor'}
            </button>
          </form>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {vendorsList && vendorsList.length > 0 ? (
              vendorsList.map((v: any) => (
                <div
                  key={v.id}
                  className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors text-[11px]"
                >
                  <p className="font-bold text-text-primary">{v.name}</p>
                  {v.email && <p className="text-[10px] text-text-secondary">{v.email}</p>}
                  {v.phone && <p className="text-[10px] text-text-secondary">{v.phone}</p>}
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted text-center py-4">No registered vendors yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Trail */}
      <DashboardActivityTrail recentActivity={recentActivity} userRole="purchase" />
    </div>
  );
}
