'use client';

import React, { useState } from 'react';
import { usePurchase } from '@/hooks/usePurchase';
import { useAuth } from '@/hooks/useAuth';
import { 
  Truck, Loader2, AlertTriangle, Check, X, ShieldAlert, 
  ShoppingCart, Calendar, Star, DollarSign, Clock, Layers, Info, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Link from 'next/link';
import { useVendors } from '@/hooks/useVendors';

export default function ProcurementPage() {
  const { useList, selectQuotation, sendRFQ, confirm: confirmPO, receive: receivePO, isSelectingQuotation, isConfirming, isReceiving, isSendingRFQ } = usePurchase();
  const { user } = useAuth();
  const userRole = user?.role || 'sales';
  const { data: orders, isLoading, isError } = useList();

  // Selected PO state
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);
  const [expandedPoId, setExpandedPoId] = useState<string | null>(null);

  // Modals state
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [selectedRfqVendors, setSelectedRfqVendors] = useState<string[]>([]);

  // Dynamic vendor registry fetch
  const { useList: useVendorsList } = useVendors();
  const { data: dbVendors } = useVendorsList();

  const activePo = React.useMemo(() => {
    return orders?.find(o => o.id === selectedPoId);
  }, [orders, selectedPoId]);

  const baseCost = React.useMemo(() => {
    return activePo?.items?.reduce((sum: number, item: any) => {
      return sum + (Number(item.quantityOrdered) * Number(item.unitCost));
    }, 0) || 1000;
  }, [activePo]);

  const dynamicVendors = React.useMemo(() => {
    if (!dbVendors || dbVendors.length === 0) {
      return [
        { name: 'Global Timber Ltd', email: 'sales@globaltimber.com', phone: '+91 88888 77777', cost: baseCost * 1.1, days: 3, rating: 4.8 },
        { name: 'Apex Fasteners Corp', email: 'info@apexfasteners.com', phone: '+91 77777 66666', cost: baseCost * 0.95, days: 1, rating: 4.9 },
        { name: 'Rainbow Coatings', email: 'orders@rainbowcoatings.com', phone: '+91 66666 55555', cost: baseCost * 0.85, days: 5, rating: 4.5 },
      ];
    }

    return dbVendors.map((v) => {
      const charSum = v.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const factor = 0.85 + ((charSum % 30) / 100);
      const days = 1 + (charSum % 6);
      const rating = parseFloat((4.0 + ((charSum % 10) / 10)).toFixed(1));

      return {
        name: v.name,
        email: v.email || `${v.name.toLowerCase().replace(/\s+/g, '')}@supplier.com`,
        phone: v.phone || `+91 ${90000 + (charSum % 10000)} ${50000 + (charSum % 50000)}`,
        cost: Math.round(baseCost * factor),
        days,
        rating,
      };
    });
  }, [dbVendors, baseCost]);

  const getRequestedVendorsForPo = (notes: string | null | undefined) => {
    if (!notes) return [];
    const match = notes.match(/RFQs dispatched to selected vendors:\s*([^\n\r]+)/);
    if (match && match[1]) {
      return match[1].split(',').map(name => name.trim());
    }
    return [];
  };

  const allowedVendors = React.useMemo(() => {
    if (!activePo) return [];
    const requested = getRequestedVendorsForPo(activePo.notes);
    const filtered = dynamicVendors.filter(v => requested.includes(v.name));
    return filtered.length > 0 ? filtered : dynamicVendors;
  }, [activePo, dynamicVendors]);

  const handleOpenRfqModal = (poId: string) => {
    setSelectedPoId(poId);
    setSelectedRfqVendors([]);
    setShowRfqModal(true);
  };

  const handleVerifyAndSendRfq = async () => {
    if (!selectedPoId || selectedRfqVendors.length === 0) return;
    try {
      await sendRFQ({
        id: selectedPoId,
        payload: { vendorNames: selectedRfqVendors }
      });
      setShowRfqModal(false);
      setSelectedPoId(null);
      setSelectedRfqVendors([]);
    } catch {
      // Handled by toast
    }
  };

  // Receipt verification parameters
  const [receiptResult, setReceiptResult] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('Quality Issue');
  const [customReason, setCustomReason] = useState('');

  const isProcurementTeam = userRole === 'admin' || userRole === 'purchase';
  const isInventoryTeam = userRole === 'admin' || userRole === 'inventory';

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-text-secondary text-sm">Loading procurement operations...</p>
      </div>
    );
  }

  if (isError || !orders) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="mx-auto text-rose-500" size={40} />
        <h2 className="text-xl font-bold text-brand-primary">Error Loading Procurement</h2>
        <p className="text-sm text-text-secondary">Could not fetch purchase orders from the server.</p>
      </div>
    );
  }

  // KPIs
  const pendingRFQs = orders.filter(o => o.status === 'draft' && (o.vendorName === 'Recommended Vendor (Pending Quote)' || o.vendorName === 'RFQ Sent (Pending Bids)'));
  const pendingPOConfirmations = orders.filter(o => o.status === 'draft' && o.vendorName && o.vendorName !== 'Recommended Vendor (Pending Quote)' && o.vendorName !== 'RFQ Sent (Pending Bids)');
  const inTransit = orders.filter(o => o.status === 'confirmed');
  const receivedCount = orders.filter(o => o.status === 'received');

  const handleSelectQuote = (poId: string) => {
    setSelectedPoId(poId);
    setShowQuoteModal(true);
  };

  const handleConfirmQuoteSelection = async (vendor: any) => {
    if (!selectedPoId) return;
    try {
      await selectQuotation({
        id: selectedPoId,
        payload: {
          vendorName: vendor.name,
          vendorEmail: vendor.email,
          vendorPhone: vendor.phone,
          totalAmount: vendor.cost,
        },
      });
      setShowQuoteModal(false);
      setSelectedPoId(null);
    } catch {
      // Handled by toast
    }
  };

  const handleConfirmPO = async (id: string) => {
    try {
      await confirmPO(id);
    } catch {
      // Handled by toast
    }
  };

  const handleVerifyReceiptClick = (poId: string) => {
    setSelectedPoId(poId);
    setShowReceiveModal(true);
  };

  const handleConfirmReceipt = async () => {
    if (!selectedPoId) return;
    const finalReason = receiptResult === 'reject' ? (rejectionReason === 'Other' ? customReason : rejectionReason) : undefined;
    try {
      await receivePO({
        id: selectedPoId,
        payload: {
          checkResult: receiptResult,
          reason: finalReason,
        },
      });
      setShowReceiveModal(false);
      setSelectedPoId(null);
      setCustomReason('');
    } catch {
      // Handled by toast
    }
  };

  const toggleRow = (id: string) => {
    setExpandedPoId(expandedPoId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="page-title">Procurement Workspace</h1>
        <p className="page-subtitle">Vendor RFQs selection, PO confirmation, and Inventory incoming goods inspection controls</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="kpi-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Pending RFQs</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{pendingRFQs.length}</p>
            <p className="text-[11px] text-amber-600 mt-1 font-semibold">Vendor quotes required</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Layers size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Awaiting PO Dispatch</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{pendingPOConfirmations.length}</p>
            <p className="text-[11px] text-purple-600 mt-1 font-semibold">Ready to confirm PO</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-[#4B164C]">
            <ShoppingCart size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">POs In-Transit (Tracking)</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{inTransit.length}</p>
            <p className="text-[11px] text-blue-600 mt-1 font-semibold">Shipped by suppliers</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Truck size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Completed Receipts</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{receivedCount.length}</p>
            <p className="text-[11px] text-emerald-600 mt-1 font-semibold">Goods verified & stocked</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Main PO Grid */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-base font-bold text-brand-primary flex items-center gap-2">
          <Truck size={18} />
          Procurement & Receipts Queue
        </h2>

        {orders.length === 0 ? (
          <Alert variant="info">
            No procurement requests active. These are raised automatically when raw materials shortages are triggered during PM production approvals.
          </Alert>
        ) : (
          <div className="border border-surface-border rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-surface-card/30 text-text-secondary uppercase">
                <tr className="border-b border-surface-border">
                  <th className="p-4 w-12 text-center">Info</th>
                  <th className="p-4">PO Number</th>
                  <th className="p-4">Vendor Partner</th>
                  <th className="p-4 text-right">Estimated Amount</th>
                  <th className="p-4">SO Source</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border bg-surface-input">
                {orders.map((po) => {
                  const isExpanded = expandedPoId === po.id;
                  const isRecommendedVendor = po.vendorName === 'Recommended Vendor (Pending Quote)' || po.vendorName === 'RFQ Sent (Pending Bids)';

                  return (
                    <React.Fragment key={po.id}>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => toggleRow(po.id)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
                          >
                            {isExpanded ? 'Hide' : 'Items'}
                          </button>
                        </td>
                        <td className="p-4">
                          <span className="font-mono font-bold text-brand-primary block">{po.orderNumber}</span>
                          <span className="text-[10px] text-text-muted block mt-0.5 max-w-[200px] truncate" title={po.items?.map((item: any) => `${item.product?.name} (${Number(item.quantityOrdered)} ${item.product?.unitOfMeasure || 'pcs'})`).join(', ')}>
                            {po.items?.map((item: any) => `${item.product?.name} (${Number(item.quantityOrdered)} ${item.product?.unitOfMeasure || 'pcs'})`).join(', ')}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-text-primary">
                          {po.vendorName}
                          {po.vendorName === 'Recommended Vendor (Pending Quote)' && (
                            <span className="ml-2 bg-amber-500/10 text-amber-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">RFQ Open</span>
                          )}
                          {po.vendorName === 'RFQ Sent (Pending Bids)' && (
                            <span className="ml-2 bg-purple-500/10 text-purple-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">RFQ Sent</span>
                          )}
                        </td>
                        <td className="p-4 text-right font-bold text-sm">
                          ₹{Number(po.totalAmount).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 font-mono font-bold text-xs text-[#4B164C]">
                          {po.triggeredBySo ? (
                            <Link href={`/sales/${po.triggeredBySoId}`} className="hover:underline">
                              {po.triggeredBySo.orderNumber}
                            </Link>
                          ) : (
                            'System Safety'
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <Badge
                            variant={
                              po.status === 'draft' ? 'gray' :
                              po.status === 'confirmed' ? 'blue' :
                              po.status === 'received' ? 'green' : 'red'
                            }
                          >
                            {po.status === 'draft'
                              ? po.vendorName === 'Recommended Vendor (Pending Quote)'
                                ? 'PENDING VERIFICATION'
                                : po.vendorName === 'RFQ Sent (Pending Bids)'
                                ? 'RFQ SENT'
                                : 'PO AWAITING DISPATCH'
                              : po.status.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {/* RFQ Verification step */}
                            {po.status === 'draft' && po.vendorName === 'Recommended Vendor (Pending Quote)' && isProcurementTeam && (
                              <Button 
                                className="bg-[#4B164C] hover:bg-[#4B164C]/95 border-0 text-white font-semibold py-1 px-3 h-8 flex items-center gap-1.5"
                                onClick={() => handleOpenRfqModal(po.id)}
                              >
                                <CheckCircle2 size={12} /> Verify & Request Quotes
                              </Button>
                            )}

                            {/* RFQ Compare Step */}
                            {po.status === 'draft' && po.vendorName === 'RFQ Sent (Pending Bids)' && isProcurementTeam && (
                              <Button 
                                className="bg-[#4B164C] hover:bg-[#4B164C]/95 border-0 text-white font-semibold py-1 px-3 h-8 flex items-center gap-1.5"
                                onClick={() => handleSelectQuote(po.id)}
                              >
                                <Star size={12} fill="white" /> Compare Quotes
                              </Button>
                            )}

                            {/* PO Dispatch step */}
                            {po.status === 'draft' && po.vendorName !== 'Recommended Vendor (Pending Quote)' && po.vendorName !== 'RFQ Sent (Pending Bids)' && isProcurementTeam && (
                              <Button 
                                className="bg-purple-600 hover:bg-purple-700 border-0 text-white font-semibold py-1 px-3 h-8 flex items-center gap-1.5"
                                onClick={() => handleConfirmPO(po.id)}
                                isLoading={isConfirming}
                              >
                                Dispatch Purchase Order
                              </Button>
                            )}

                            {/* Verification Receipt Step */}
                            {po.status === 'confirmed' && isInventoryTeam && (
                              <Button 
                                className="bg-emerald-600 hover:bg-emerald-700 border-0 text-white font-semibold py-1 px-3 h-8 flex items-center gap-1.5"
                                onClick={() => handleVerifyReceiptClick(po.id)}
                              >
                                <Check size={14} /> Verify Goods Receipt
                              </Button>
                            )}

                            {po.status === 'received' && (
                              <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                                <Check size={14} /> Receipts Verified
                              </span>
                            )}
                            {po.status === 'cancelled' && (
                              <span className="text-rose-500 font-bold text-xs">Receipt Rejected</span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Items Details */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={7} className="p-4 border-t border-b border-surface-border">
                            <div className="max-w-3xl mx-auto space-y-3">
                              <h4 className="font-bold text-xs text-brand-primary flex items-center gap-1.5 pb-2 border-b border-slate-200">
                                <Layers size={14} /> Procurement Line Items list
                              </h4>

                              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-slate-50 text-text-secondary uppercase">
                                    <tr>
                                      <th className="p-3">Raw Material Product</th>
                                      <th className="p-3 text-right">Quantity Ordered</th>
                                      <th className="p-3 text-right">Standard Unit Cost</th>
                                      <th className="p-3 text-right">Item Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {po.items.map((item: any) => (
                                      <tr key={item.id}>
                                        <td className="p-3 font-semibold text-text-primary">
                                          {item.product.name}
                                          <p className="text-[10px] text-text-muted">SKU: {item.product.sku}</p>
                                        </td>
                                        <td className="p-3 text-right font-medium">{Number(item.quantityOrdered)} {item.product.unitOfMeasure}</td>
                                        <td className="p-3 text-right text-text-secondary">₹{Number(item.unitCost).toLocaleString('en-IN')}</td>
                                        <td className="p-3 text-right font-bold text-brand-primary">₹{(Number(item.quantityOrdered) * Number(item.unitCost)).toLocaleString('en-IN')}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              <div className="text-xs p-3.5 bg-white border border-surface-border rounded-xl text-text-secondary leading-relaxed font-medium">
                                <strong>Internal Logs:</strong> {po.notes || 'No supplementary procurement comments logged.'}
                              </div>

                              {po.quotations && po.quotations.length > 0 && (
                                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white p-3.5 space-y-2">
                                  <h5 className="font-bold text-xs text-[#4B164C] border-b border-slate-100 pb-1.5">
                                    Supplier RFQ Quotation Bids History Log
                                  </h5>
                                  <div className="space-y-1.5 text-[11px] font-semibold text-text-secondary">
                                    {po.quotations.map((q: any, idx: number) => (
                                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100/50">
                                        <div className="flex items-center gap-2">
                                          <span className={`w-2 h-2 rounded-full ${q.status === 'selected' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                          <span className="font-bold text-text-primary">{q.vendorName}</span>
                                          {q.rating && <span className="text-[10px] text-amber-500">★ {Number(q.rating)}</span>}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs">
                                          <span>Lead Time: <b>{q.deliveryDays} Days</b></span>
                                          <span className="font-bold text-brand-primary">₹{Number(q.totalAmount).toLocaleString('en-IN')}</span>
                                          <Badge variant={q.status === 'selected' ? 'green' : q.status === 'rejected' ? 'red' : 'gray'}>
                                            {q.status.toUpperCase()}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RFQ Verification Modal */}
      {showRfqModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-surface-border max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-[#4B164C] flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#4B164C]" /> Verify Procurement & Send RFQs
              </h3>
              <button onClick={() => setShowRfqModal(false)} className="text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-text-secondary">
                Verify the raw material shortage request and select supplier partners to send Request for Quotes (RFQs):
              </p>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1.5 text-xs text-text-secondary">
                <p className="font-bold text-[#4B164C] uppercase text-[10px] tracking-wider mb-1">Items Requested:</p>
                {activePo?.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between font-semibold">
                    <span>{item.product?.name} (SKU: {item.product?.sku})</span>
                    <span className="font-bold text-text-primary">{Number(item.quantityOrdered)} {item.product?.unitOfMeasure || 'pcs'}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto border border-surface-border rounded-xl p-3 bg-slate-50/50">
                {dbVendors && dbVendors.length > 0 ? (
                  dbVendors.map((v) => (
                    <label key={v.id} className="flex items-center gap-2.5 text-xs font-semibold text-text-primary cursor-pointer hover:bg-slate-100 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedRfqVendors.includes(v.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRfqVendors([...selectedRfqVendors, v.name]);
                          } else {
                            setSelectedRfqVendors(selectedRfqVendors.filter(name => name !== v.name));
                          }
                        }}
                        className="rounded border-slate-300 accent-brand-primary"
                      />
                      {v.name}
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-text-muted italic p-2">No registered vendors available. Seeded defaults will be used.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
              <Button variant="secondary" onClick={() => setShowRfqModal(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#4B164C] hover:bg-[#381039] text-white border-0"
                onClick={handleVerifyAndSendRfq}
                isLoading={isSendingRFQ}
                disabled={selectedRfqVendors.length === 0}
              >
                Verify & Send RFQs
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Comparison Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-surface-border max-w-2xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-[#4B164C] flex items-center gap-2">
                <Star size={18} fill="#4B164C" /> Evaluate Vendor Bids & RFQ Responses
              </h3>
              <button onClick={() => setShowQuoteModal(false)} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-text-secondary">Compare cost price, delivery estimates, and historical vendor ratings for the required component checklist items:</p>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1.5 text-xs text-text-secondary">
                <p className="font-bold text-[#4B164C] uppercase text-[10px] tracking-wider mb-1">Items Requested:</p>
                {activePo?.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between font-semibold">
                    <span>{item.product?.name} (SKU: {item.product?.sku})</span>
                    <span className="font-bold text-text-primary">{Number(item.quantityOrdered)} {item.product?.unitOfMeasure || 'pcs'}</span>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {allowedVendors.map((vendor) => (
                  <div 
                    key={vendor.name} 
                    className="p-4 border border-brand-accent/20 rounded-xl bg-[#F8E7F6]/10 hover:border-brand-primary/40 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-brand-primary">{vendor.name}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">{vendor.email}</p>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary text-[11px]">Total Cost:</span>
                        <span className="font-bold text-brand-primary">₹{vendor.cost.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary text-[11px]">Transit:</span>
                        <span className="font-bold text-amber-600 flex items-center gap-1">
                          <Clock size={12} /> {vendor.days} days
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary text-[11px]">Vendor Rating:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <Star size={12} fill="currentColor" /> {vendor.rating}
                        </span>
                      </div>
                    </div>

                    <Button 
                      className="w-full text-xs font-semibold py-1.5 bg-[#4B164C] hover:bg-[#4B164C]/95 text-white border-0"
                      onClick={() => handleConfirmQuoteSelection(vendor)}
                      isLoading={isSelectingQuotation}
                    >
                      Select Quote
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Receipt Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-surface-border max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-[#4B164C] flex items-center gap-2">
                <CheckCircle2 size={16} /> Incoming Shipment Verification
              </h3>
              <button onClick={() => setShowReceiveModal(false)} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-text-secondary">Verify the PO, invoice values, quantity ordered, and check for material quality issues:</p>

              {/* Purchase Order & Invoice Display */}
              <div className="grid grid-cols-1 gap-3">
                {/* PO Details Panel */}
                <div className="border border-surface-border rounded-xl p-3 bg-slate-50 space-y-1.5 text-xs text-text-secondary">
                  <p className="font-bold text-[#4B164C] uppercase text-[10px] tracking-wider border-b border-slate-200/80 pb-1">PO Details ({activePo?.orderNumber})</p>
                  <div className="space-y-1">
                    {activePo?.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between font-medium">
                        <span>{item.product?.name} (SKU: {item.product?.sku})</span>
                        <span className="font-bold text-text-primary">{Number(item.quantityOrdered)} {item.product?.unitOfMeasure || 'pcs'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invoice Panel */}
                {activePo && (
                  <div className="border border-dashed border-brand-accent/30 rounded-xl p-3.5 bg-brand-primary/[0.02] space-y-2">
                    <div className="flex justify-between items-start border-b border-slate-200/80 pb-1.5">
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Supplier Invoice</span>
                        <p className="font-mono font-bold text-[#4B164C] text-xs mt-0.5">
                          {activePo.invoices?.[0]?.invoiceNumber || 
                            `INV-${new Date(activePo.createdAt).getFullYear()}-${Math.floor(100000 + (activePo.orderNumber.split('-')[1] ? parseInt(activePo.orderNumber.split('-')[1]) * 100 : 500000))}`}
                        </p>
                      </div>
                      <Badge variant={(activePo.invoices?.[0]?.status || 'pending') === 'verified' ? 'green' : 'amber'}>
                        {(activePo.invoices?.[0]?.status || 'pending') === 'verified' ? 'Verified' : 'Pending Review'}
                      </Badge>
                    </div>
                    <div className="text-[11px] space-y-1 font-semibold text-text-secondary">
                      <div className="flex justify-between">
                        <span>Supplier Partner:</span>
                        <span className="text-text-primary">{activePo.vendorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Invoice Total Amount:</span>
                        <span className="text-[#4B164C] font-bold">₹{Number(activePo.invoices?.[0]?.amount || activePo.totalAmount).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date Issued:</span>
                        <span>
                          {activePo.invoices?.[0]?.createdAt 
                            ? format(new Date(activePo.invoices[0].createdAt), 'dd MMM yyyy, hh:mm a')
                            : format(new Date(activePo.createdAt), 'dd MMM yyyy, hh:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 border border-surface-border rounded-xl p-3.5 bg-slate-50">
                <label className="flex items-center gap-2 text-xs font-bold text-emerald-600 cursor-pointer">
                  <input
                    type="radio"
                    name="receiptResult"
                    value="approve"
                    checked={receiptResult === 'approve'}
                    onChange={() => setReceiptResult('approve')}
                    className="accent-emerald-600"
                  />
                  Verify & Approve Receipt
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-rose-500 cursor-pointer">
                  <input
                    type="radio"
                    name="receiptResult"
                    value="reject"
                    checked={receiptResult === 'reject'}
                    onChange={() => setReceiptResult('reject')}
                    className="accent-rose-500"
                  />
                  Reject Material Shipment
                </label>
              </div>

              {receiptResult === 'reject' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {['Quality Issue', 'Quantity Mismatch', 'Damage', 'Invoice Mismatch', 'Other'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2.5 text-xs font-semibold text-text-secondary cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                        <input
                          type="radio"
                          name="rejectionReason"
                          value={opt}
                          checked={rejectionReason === opt}
                          onChange={() => setRejectionReason(opt)}
                          className="accent-brand-primary"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>

                  {rejectionReason === 'Other' && (
                    <textarea
                      className="w-full text-xs p-3 rounded-xl border border-surface-border focus:ring-1 focus:ring-brand-primary focus:outline-none"
                      placeholder="Specify details here..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      rows={3}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
              <Button variant="secondary" onClick={() => setShowReceiveModal(false)}>Cancel</Button>
              <Button
                className={receiptResult === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-0' : 'bg-rose-600 hover:bg-rose-700 text-white border-0'}
                onClick={handleConfirmReceipt}
                isLoading={isReceiving}
                disabled={receiptResult === 'reject' && rejectionReason === 'Other' && !customReason}
              >
                Confirm Verification
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
