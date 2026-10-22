'use client';

import React, { useState } from 'react';
import { useSales } from '@/hooks/useSales';
import { 
  Clock, Loader2, AlertTriangle, Check, X, ArrowRight, ShoppingCart, User, Layers, Search
} from 'lucide-react';
import { format } from 'date-fns';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Link from 'next/link';

const safeFormatDate = (dateVal: any, formatStr = 'MMM d, yyyy HH:mm') => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  try {
    return format(d, formatStr);
  } catch {
    return '';
  }
};

export default function BusinessTimelinePage() {
  const { useList } = useSales();
  const { data: orders, isLoading, isError } = useList();
  
  // Selected Order
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-text-secondary text-sm">Loading operations timelines...</p>
      </div>
    );
  }

  if (isError || !orders) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="mx-auto text-rose-500" size={40} />
        <h2 className="text-xl font-bold text-brand-primary">Error Loading Timelines</h2>
        <p className="text-sm text-text-secondary">Verify connection pools to reconstruct the audit logs.</p>
      </div>
    );
  }

  // Filter orders by search
  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Set default selection
  const activeOrder = selectedOrderId 
    ? orders.find(o => o.id === selectedOrderId) 
    : filteredOrders[0];

  // Re-build timeline steps dynamically
  const buildTimelineSteps = (order: any) => {
    if (!order) return [];

    const timelineItems = [];

    const mos = order.manufacturingOrders || [];
    const hasMo = mos.length > 0;
    const primaryMo = mos[0];

    const pos = order.purchaseOrders || [];
    const hasPo = pos.length > 0;
    const primaryPo = pos[0];

    // Step 1: Production Request Raised
    timelineItems.push({
      label: 'Production Request Raised',
      status: hasMo ? 'checked' : 'pending',
      timestamp: primaryMo?.createdAt,
      owner: primaryMo?.creator?.name || 'Sales Executive',
      dept: 'Sales',
      details: hasMo 
        ? `Production request generated. MO(s): ${mos.map((m: any) => m.orderNumber).join(', ')}`
        : 'Awaiting production request trigger.',
    });

    // Step 2: PM Approved
    let pmStatus: 'checked' | 'pending' | 'failed' = 'pending';
    let pmDetails = 'Awaiting decision on production feasibility.';
    let pmTimestamp = undefined;
    let pmLabel = 'PM Approved';
    if (hasMo) {
      const isRejected = primaryMo.status === 'cancelled';
      const isApproved = ['confirmed', 'in_progress', 'completed'].includes(primaryMo.status);
      if (isRejected) {
        pmStatus = 'failed';
        pmLabel = 'Rejected Criteria';
        const rejectMatch = primaryMo.notes?.match(/Reason:\s*([^\n\r]+)/);
        const reasonStr = rejectMatch ? rejectMatch[1] : 'Capacity constraints or material missing';
        pmDetails = `Rejection reason: ${reasonStr}.`;
        pmTimestamp = primaryMo.updatedAt;
      } else if (isApproved) {
        pmStatus = 'checked';
        pmDetails = `PM approved production run of product recipe: ${order.items?.map((i: any) => i.product?.name).join(', ') || 'Finished Goods'}.`;
        pmTimestamp = primaryMo.updatedAt;
      }
    }
    timelineItems.push({
      label: pmLabel,
      status: pmStatus,
      timestamp: pmTimestamp,
      owner: 'Ravi Sharma',
      dept: 'Product Manager',
      details: pmDetails,
    });

    // Step 3: Raw Material Validation
    let rmValStatus: 'checked' | 'pending' = 'pending';
    let rmValDetails = 'Pending PM approval to validate raw materials.';
    if (pmStatus === 'checked') {
      rmValStatus = 'checked';
      rmValDetails = 'BOM exploded, components requirement validated against stock levels.';
    }
    timelineItems.push({
      label: 'Raw Material Validation',
      status: rmValStatus,
      timestamp: pmStatus === 'checked' ? primaryMo?.updatedAt : undefined,
      owner: 'Ravi Sharma',
      dept: 'Product Manager',
      details: rmValDetails,
    });

    // Step 4: Shortage Detected
    let shortageStatus: 'checked' | 'pending' = 'pending';
    let shortageDetails = 'Awaiting components validation.';
    if (pmStatus === 'checked') {
      shortageStatus = 'checked';
      if (hasPo) {
        shortageDetails = 'Shortages identified: raw materials required are not available in stock.';
      } else {
        shortageDetails = 'BOM check complete. Sufficient raw materials available on hand.';
      }
    }
    timelineItems.push({
      label: 'Shortage Detected',
      status: shortageStatus,
      timestamp: pmStatus === 'checked' ? (primaryPo?.createdAt || primaryMo?.updatedAt) : undefined,
      owner: 'Ravi Sharma',
      dept: 'Product Manager',
      details: shortageDetails,
    });

    // Step 5: Procurement Requested
    let procStatus: 'checked' | 'pending' = 'pending';
    let procDetails = 'Awaiting material shortage results.';
    if (pmStatus === 'checked') {
      procStatus = 'checked';
      if (hasPo) {
        const isVerified = pos.some((p: any) => p.vendorName !== 'Recommended Vendor (Pending Quote)');
        if (isVerified) {
          procDetails = `Procurement verified. RFQs sent: ${pos.map((p: any) => p.orderNumber).join(', ')}`;
        } else {
          procDetails = `Draft procurement raised: ${pos.map((p: any) => p.orderNumber).join(', ')} (Awaiting verification)`;
        }
      } else {
        procDetails = 'Skipped: Sufficient raw materials available on hand.';
      }
    }
    timelineItems.push({
      label: 'Procurement Requested',
      status: procStatus,
      timestamp: primaryPo?.createdAt || (pmStatus === 'checked' ? primaryMo?.updatedAt : undefined),
      owner: 'Procurement Engine',
      dept: 'Supply Chain',
      details: procDetails,
    });

    // Step 6: Vendor Selected
    let vendorStatus: 'checked' | 'pending' | 'failed' = 'pending';
    let vendorDetails = 'Awaiting procurement request confirmation.';
    let vendorTimestamp = undefined;
    if (pmStatus === 'checked') {
      if (hasPo) {
        const allConfirmed = pos.every((p: any) => ['confirmed', 'received'].includes(p.status));
        const anyCancelled = pos.some((p: any) => p.status === 'cancelled');
        const isVerified = pos.some((p: any) => p.vendorName !== 'Recommended Vendor (Pending Quote)');
        const hasSelectedVendor = pos.some((p: any) => p.vendorName !== 'Recommended Vendor (Pending Quote)' && p.vendorName !== 'RFQ Sent (Pending Bids)');

        if (allConfirmed) {
          vendorStatus = 'checked';
          vendorDetails = `Vendor approved. Purchase orders dispatch locked.`;
          vendorTimestamp = primaryPo.confirmedAt || primaryPo.updatedAt;
        } else if (anyCancelled) {
          vendorStatus = 'failed';
          vendorDetails = 'Vendor quote selection failed or PO cancelled.';
          vendorTimestamp = primaryPo.updatedAt;
        } else if (hasSelectedVendor) {
          const selectedVendorName = pos.find((p: any) => p.vendorName !== 'Recommended Vendor (Pending Quote)' && p.vendorName !== 'RFQ Sent (Pending Bids)')?.vendorName || '';
          vendorStatus = 'checked';
          vendorDetails = `Vendor quote selected: ${selectedVendorName}. Awaiting PO dispatch.`;
          vendorTimestamp = primaryPo.updatedAt;
        } else if (isVerified) {
          vendorStatus = 'pending';
          vendorDetails = 'RFQ sent. Comparing vendor quotes.';
        } else {
          vendorStatus = 'pending';
          vendorDetails = 'Awaiting procurement manager verification & RFQ target selection.';
        }
      } else {
        vendorStatus = 'checked';
        vendorDetails = 'Skipped: Procurement not required.';
      }
    }
    timelineItems.push({
      label: 'RFQ Vendor Selected',
      status: vendorStatus,
      timestamp: vendorTimestamp,
      owner: 'Amit Patel',
      dept: 'Procurement',
      details: vendorDetails,
    });

    // Step 7: Materials Received
    let recStatus: 'checked' | 'pending' | 'failed' = 'pending';
    let recDetails = 'Awaiting incoming supplier shipments.';
    let recTimestamp = undefined;
    if (pmStatus === 'checked') {
      if (hasPo) {
        const allReceived = pos.every((p: any) => p.status === 'received');
        const isCancelled = pos.some((p: any) => p.status === 'cancelled');
        if (allReceived) {
          recStatus = 'checked';
          recDetails = 'Quality checked, quantity verified & received into warehouse.';
          recTimestamp = primaryPo.receivedAt;
        } else if (isCancelled) {
          recStatus = 'failed';
          recDetails = 'Supplier delivery rejected due to quality check failure.';
          recTimestamp = primaryPo.updatedAt;
        }
      } else {
        recStatus = 'checked';
        recDetails = 'Skipped: Component inventory sufficient.';
      }
    }
    timelineItems.push({
      label: 'Materials Received',
      status: recStatus,
      timestamp: recTimestamp,
      owner: 'Neha Gupta',
      dept: 'Inventory',
      details: recDetails,
    });

    // Step 8: Manufacturing Ready
    let readyStatus: 'checked' | 'pending' = 'pending';
    let readyDetails = 'Awaiting material allocation check.';
    if (hasMo && pmStatus === 'checked') {
      if (hasPo) {
        const allReceived = pos.every((p: any) => p.status === 'received');
        if (allReceived) {
          readyStatus = 'checked';
          readyDetails = 'All missing components received. Inventory allocated.';
        } else {
          readyStatus = 'pending';
          readyDetails = 'Waiting for procurement to resolve raw material shortages.';
        }
      } else {
        readyStatus = 'checked';
        readyDetails = 'All components available. Ready to start manufacturing.';
      }
    }
    timelineItems.push({
      label: 'Manufacturing Ready',
      status: readyStatus,
      timestamp: pmStatus === 'checked' ? primaryMo?.updatedAt : undefined,
      owner: 'Ravi Sharma',
      dept: 'Product Manager',
      details: readyDetails,
    });

    // Step 9: Manufacturing Started
    let startStatus: 'checked' | 'pending' = 'pending';
    let startDetails = 'Awaiting queue launch on shop floor.';
    let startTimestamp = undefined;
    if (hasMo) {
      const anyStarted = mos.some((m: any) => ['in_progress', 'completed'].includes(m.status));
      if (anyStarted) {
        startStatus = 'checked';
        startDetails = `Production run executing on machine.`;
        startTimestamp = primaryMo.actualStart;
      }
    }
    timelineItems.push({
      label: 'Manufacturing Started',
      status: startStatus,
      timestamp: startTimestamp,
      owner: 'Ravi Sharma',
      dept: 'Product Manager',
      details: startDetails,
    });

    // Step 10: Manufacturing Completed
    let compStatus: 'checked' | 'pending' = 'pending';
    let compDetails = 'Processing machine outputs and quality audits.';
    let compTimestamp = undefined;
    if (hasMo) {
      const allCompleted = mos.every((m: any) => m.status === 'completed');
      if (allCompleted) {
        compStatus = 'checked';
        compDetails = 'Finished goods passed quality inspection and added to stock.';
        compTimestamp = primaryMo.actualEnd;
      }
    }
    timelineItems.push({
      label: 'Manufacturing Completed',
      status: compStatus,
      timestamp: compTimestamp,
      owner: 'Ravi Sharma',
      dept: 'Product Manager',
      details: compDetails,
    });

    return timelineItems;
  };

  const steps = buildTimelineSteps(activeOrder);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="page-title">Business Timeline Traceability</h1>
        <p className="page-subtitle">End-to-end supply chain visibility for Shiva Furniture Works customer orders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Select Orders */}
        <div className="glass-card p-5 space-y-4">
          <div className="relative">
            <input
              type="text"
              className="w-full text-xs p-3 pl-9 rounded-xl border border-surface-border bg-surface-input focus:outline-none focus:ring-1 focus:ring-brand-primary"
              placeholder="Search sales orders or customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-text-muted" size={14} />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
            {filteredOrders.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">No matching orders found.</p>
            ) : (
              filteredOrders.map((ord) => {
                const isActive = activeOrder?.id === ord.id;
                return (
                  <button
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                      isActive 
                        ? 'border-brand-primary/40 bg-[#F8E7F6]/20' 
                        : 'border-surface-border bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-mono font-bold text-brand-primary">{ord.orderNumber}</span>
                      <Badge
                        variant={
                          ord.status === 'draft' ? 'gray' :
                          ord.status === 'confirmed' ? 'blue' :
                          ord.status === 'shortage_detected' ? 'red' :
                          ord.status === 'ready' ? 'amber' : 'green'
                        }
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-text-primary text-[11px]">
                      <User size={12} className="text-text-muted" />
                      {ord.customerName}
                    </div>
                    <div className="flex justify-between w-full text-[10px] text-text-muted">
                      <span>{safeFormatDate(ord.createdAt, 'MMM d, yyyy')}</span>
                      <span className="font-bold text-brand-primary">₹{Number(ord.totalAmount).toLocaleString('en-IN')}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Visual Timeline */}
        <div className="lg:col-span-2 glass-card p-6 space-y-6">
          {activeOrder ? (
            <>
              <div className="flex justify-between items-start pb-4 border-b border-surface-border">
                <div>
                  <h3 className="text-lg font-bold text-brand-primary flex items-center gap-2">
                    <Clock size={20} />
                    Traceability Timeline: {activeOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Authorized lifecycle progress of order for <strong>{activeOrder.customerName}</strong>
                  </p>
                </div>
                <Link href={`/sales/${activeOrder.id}`} className="text-xs font-bold text-brand-primary hover:underline">
                  View Sales Order →
                </Link>
              </div>

              <div className="relative pl-2 space-y-6 max-w-2xl">
                {/* Timeline vertical bar */}
                <div className="absolute left-[13px] top-2 bottom-2 w-px bg-surface-border" />

                {steps.map((step, idx) => {
                  const isChecked = step.status === 'checked';
                  const isFailed = step.status === 'failed';
                  const isPending = step.status === 'pending';

                  return (
                    <div key={idx} className="flex gap-4 text-xs relative group animate-slide-up">
                      {/* Circle Node */}
                      <div className="z-10 mt-1 shrink-0">
                        {isChecked ? (
                          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-white shadow-sm">
                            <Check size={10} className="stroke-[3]" />
                          </span>
                        ) : isFailed ? (
                          <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center border-4 border-white shadow-sm">
                            <X size={10} className="stroke-[3]" />
                          </span>
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center border-4 border-white shadow-sm group-hover:bg-slate-300 transition-colors" />
                        )}
                      </div>

                      <div className="space-y-0.5 flex-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className={`font-bold text-sm ${isPending ? 'text-text-muted' : isFailed ? 'text-rose-500' : 'text-text-primary'}`}>
                            {step.label}
                          </span>
                          {step.timestamp && safeFormatDate(step.timestamp) && (
                            <span className="text-[10px] text-text-muted font-bold">
                              {safeFormatDate(step.timestamp)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#4B164C] font-bold">
                          <span className="bg-[#F8E7F6] px-1.5 py-0.5 rounded">{step.dept}</span>
                          {step.owner && <span>{step.owner}</span>}
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed pt-0.5">
                          {step.details}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-text-muted">
              Select an order on the left to review its operational trace logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
