'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSales } from '@/hooks/useSales';
import { useManufacturing } from '@/hooks/useManufacturing';
import { useAuth } from '@/hooks/useAuth';
import { 
  Package, Loader2, Calendar, User, Phone, Mail, 
  AlertTriangle, ArrowLeft, CheckCircle, Clock,
  ArrowRight, ShieldAlert, Check, X, FileText, Settings
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

const safeFormatDate = (dateVal: any, formatStr = 'MMM d, HH:mm') => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  try {
    return format(d, formatStr);
  } catch {
    return '';
  }
};

export default function SalesOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { useGet, confirm: confirmOrder, deliver, cancel, isConfirming, isDelivering, isCancelling } = useSales();
  const { create: requestProduction, isCreating: isRequestingProduction } = useManufacturing();
  const { user } = useAuth();
  const userRole = user?.role || 'sales';
  const isPMOrAdmin = userRole === 'admin' || userRole === 'product_manager';
  const { data: order, isLoading, isError } = useGet(id);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-text-secondary text-sm">Loading order details...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full inline-block">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-brand-primary">Order Not Found</h2>
        <p className="text-sm text-text-secondary">The sales order you are looking for does not exist or has been deleted.</p>
        <Link href="/sales" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Sales Orders
        </Link>
      </div>
    );
  }

  const handleConfirmAction = async () => {
    try {
      await confirmOrder(id);
    } catch {
      // Handled by toast
    }
  };

  const handleDeliverAction = async () => {
    try {
      await deliver(id);
    } catch {
      // Handled by toast
    }
  };

  const handleCancelAction = async () => {
    if (!window.confirm('Cancel this sales order? Reserved stock will be released.')) return;
    try {
      await cancel(id);
    } catch {
      // Handled by toast
    }
  };

  const handleRequestProduction = async () => {
    try {
      await requestProduction({ salesOrderId: id });
    } catch {
      // Handled by toast
    }
  };

  // Shortage parser helper
  const parseShortageAnalysis = (notes: string | null | undefined) => {
    if (!notes) return null;
    const delimiter = '\n\n[Shortage Analysis]\n';
    const parts = notes.split(delimiter);
    if (parts.length < 2) return null;
    try {
      return JSON.parse(parts[1]);
    } catch {
      return null;
    }
  };

  const getOriginalNotes = (notes: string | null | undefined) => {
    if (!notes) return '';
    const delimiter = '\n\n[Shortage Analysis]\n';
    const firstPart = notes.split(delimiter)[0];
    const triggerDelimiter = '\n\n[Production Rejected]';
    return firstPart.split(triggerDelimiter)[0];
  };

  const shortageReport = parseShortageAnalysis(order.notes);
  const originalNotes = getOriginalNotes(order.notes);

  // Timeline construction
  const buildBusinessTimeline = () => {
    const timelineItems = [];

    const mos = (order as any).manufacturingOrders || [];
    const hasMo = mos.length > 0;
    const primaryMo = mos[0];

    const pos = (order as any).purchaseOrders || [];
    const hasPo = pos.length > 0;
    const primaryPo = pos[0];

    // Step 1: Production Request Raised
    timelineItems.push({
      label: 'Production Request Raised',
      status: hasMo ? ('checked' as const) : ('pending' as const),
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
        pmDetails = `PM approved production run of product recipe: ${order.items.map((i: any) => i.product.name).join(', ')}.`;
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

  const timelineSteps = buildBusinessTimeline();
  const orderMos = (order as any).manufacturingOrders || [];
  const hasActiveMo = orderMos.some((m: any) => m.status !== 'cancelled');

  return (
    <div className="space-y-6">
      {/* Back & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-hover mb-2 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Sales
          </button>
          <div className="flex items-center gap-3">
            <h1 className="page-title">Sales Order: {order.orderNumber}</h1>
            <Badge
              variant={
                order.status === 'draft' ? 'gray' :
                order.status === 'confirmed' ? 'blue' :
                order.status === 'shortage_detected' ? 'red' :
                order.status === 'ready' ? 'amber' : 'green'
              }
            >
              {order.status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>
          <p className="page-subtitle">Detailed allocation breakdown and delivery dispatch control</p>
        </div>

        <div className="flex items-center gap-2">
          {order.status === 'shortage_detected' && (userRole === 'sales' || userRole === 'admin') && (
            hasActiveMo ? (
              <Link 
                href="/manufacturing" 
                className="btn-secondary text-xs font-semibold flex items-center gap-1.5 py-2 px-3 bg-white border border-surface-border text-brand-primary rounded-xl hover:bg-surface-hover transition-colors shadow-sm"
              >
                <CheckCircle size={14} className="text-emerald-500" />
                Production Requested
              </Link>
            ) : (
              <Button 
                type="button" 
                className="bg-[#4B164C] hover:bg-[#4b164c]/90 border-0" 
                onClick={handleRequestProduction} 
                isLoading={isRequestingProduction}
                disabled={isRequestingProduction}
              >
                Request Production
              </Button>
            )
          )}
          {(order.status === 'draft' || order.status === 'shortage_detected') && (
            <Button type="button" onClick={handleConfirmAction} isLoading={isConfirming}>
              Confirm & Check Stock
            </Button>
          )}
          {order.status === 'ready' && (
            <Button type="button" className="bg-emerald-600 hover:bg-emerald-700 border-0" onClick={handleDeliverAction} isLoading={isDelivering}>
              Deliver Order
            </Button>
          )}
          {!['delivered', 'cancelled'].includes(order.status) && (
            <Button type="button" variant="danger" onClick={handleCancelAction} isLoading={isCancelling}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ordered items */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-brand-primary flex items-center gap-2">
              <Package size={18} />
              Ordered Items Recipe
            </h3>
            
            <div className="border border-surface-border rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-card/30 text-text-secondary uppercase">
                  <tr>
                    <th className="p-4">Product Details</th>
                    <th className="p-4 text-right">Quantity</th>
                    <th className="p-4 text-right">Unit Price</th>
                    <th className="p-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border bg-surface-input">
                  {order.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="p-4">
                        <p className="font-semibold text-text-primary text-sm">{item.product.name}</p>
                        <p className="text-xs text-text-muted">SKU: {item.product.sku}</p>
                      </td>
                      <td className="p-4 text-right font-medium text-sm">
                        {Number(item.quantityOrdered)} {item.product.unitOfMeasure}
                      </td>
                      <td className="p-4 text-right text-sm">
                        INR {Number(item.unitPrice).toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-bold text-brand-primary text-sm">
                        INR {Number(item.subtotal || (Number(item.quantityOrdered) * Number(item.unitPrice))).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="text-right pr-4 pt-2 border-t border-surface-border flex justify-end items-center gap-4">
              <span className="text-sm text-text-secondary">Grand Total Amount:</span>
              <span className="font-bold text-brand-primary text-xl">INR {Number(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>

          {/* Shortage report details */}
          {order.status === 'shortage_detected' && shortageReport && (
            <div className="glass-card p-6 space-y-4 border-rose-500/20">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle size={18} />
                Shortage Components Explosion Analysis
              </h3>
              
              <Alert variant="danger">
                Insufficient finished goods in stock. Review components shortage exploded below to clear manufacturing bottlenecks.
              </Alert>

              <div className="space-y-4">
                {shortageReport.shortages.map((sh: any, sIdx: number) => (
                  <div key={sIdx} className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-rose-500/10 pb-2">
                      <span className="font-bold text-rose-500">{sh.productName} ({sh.sku})</span>
                      <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded text-xs font-bold">
                        Shortage: {sh.shortage} pcs
                      </span>
                    </div>

                    {isPMOrAdmin ? (
                      sh.hasBom ? (
                        <div className="space-y-2">
                          <p className="text-xs text-text-secondary italic">Exploding BOM recipe: {sh.bomName}</p>
                          <div className="space-y-1.5">
                            {sh.materialsNeeded.map((mat: any, mIdx: number) => {
                              const isMissing = mat.shortage > 0;
                              return (
                                <div key={mIdx} className="flex justify-between items-center text-xs p-2.5 rounded bg-surface-input border border-surface-border/50">
                                  <span className="text-text-primary font-semibold">{mat.productName || mat.product}</span>
                                  <div className="flex items-center gap-4">
                                    <span className="text-text-secondary text-xs">
                                      Needed: {mat.required} | Free: {mat.available}
                                    </span>
                                    {isMissing ? (
                                      <span className="text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded text-xs">
                                        Missing: {mat.shortage} {mat.unitOfMeasure}
                                      </span>
                                    ) : (
                                      <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-xs">
                                        Available
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-rose-500 pl-2">No active BoM recipe found to explode components!</p>
                      )
                    ) : (
                      <p className="text-xs text-text-muted pl-2 italic">Detailed component breakdown restricted to Admin/Product Manager.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.status === 'ready' && (
            <div className="glass-card p-6 border-emerald-500/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full">
                  <CheckCircle size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-emerald-400">All Materials Reserved & Ready</h3>
                  <p className="text-sm text-text-secondary">
                    Every finished good line item on this sales order is fully allocated and locked in stock. You can safely ship this order.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-6">
          {/* Customer Panel */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-brand-primary flex items-center gap-2">
              <User size={18} />
              Customer Details
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <span className="text-text-muted w-16">Name:</span>
                <span className="font-semibold text-text-primary">{order.customerName}</span>
              </div>
              
              {order.customerPhone && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="text-text-muted w-16">Phone:</span>
                  <span>{order.customerPhone}</span>
                </div>
              )}
              
              {order.customerEmail && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="text-text-muted w-16">Email:</span>
                  <a href={`mailto:${order.customerEmail}`} className="text-brand-primary hover:underline">{order.customerEmail}</a>
                </div>
              )}
            </div>
          </div>

          {/* Connected Business Timeline Panel */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-brand-primary flex items-center gap-2">
              <Clock size={18} />
              Connected Business Timeline
            </h3>

            <div className="relative pl-1.5 space-y-5">
              {/* Timeline vertical bar */}
              <div className="absolute left-[13px] top-2 bottom-2 w-px bg-surface-border" />

              {timelineSteps.map((step, idx) => {
                const isChecked = step.status === 'checked';
                const isFailed = step.status === 'failed';
                const isPending = step.status === 'pending';

                return (
                  <div key={idx} className="flex gap-3 text-xs relative group">
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

                    <div className="space-y-0.5">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className={`font-bold ${isPending ? 'text-text-muted' : isFailed ? 'text-rose-500' : 'text-text-primary'}`}>
                          {step.label}
                        </span>
                        {step.timestamp && safeFormatDate(step.timestamp) && (
                          <span className="text-[10px] text-text-muted whitespace-nowrap font-medium">
                            {safeFormatDate(step.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#4B164C] font-semibold">
                        <span>{step.dept}</span>
                        {step.owner && <span>• {step.owner}</span>}
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        {step.details}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes Panel */}
          {originalNotes && (
            <div className="glass-card p-6 space-y-3">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Internal Notes</h3>
              <p className="text-xs p-3.5 bg-surface-input rounded-xl border border-surface-border text-text-secondary leading-relaxed font-medium">
                {originalNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
