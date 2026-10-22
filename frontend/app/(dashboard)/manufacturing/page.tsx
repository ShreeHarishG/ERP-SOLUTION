'use client';

import React, { useState } from 'react';
import { useManufacturing } from '@/hooks/useManufacturing';
import { useAuth } from '@/hooks/useAuth';
import { 
  Hammer, Loader2, AlertTriangle, Play, CheckCircle2, 
  Calendar, Check, X, ClipboardList, Info, Cpu, Layers, Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Link from 'next/link';

export default function ManufacturingPage() {
  const { useList, approve, reject, start, complete, isApproving, isRejecting, isStarting, isCompleting } = useManufacturing();
  const { user } = useAuth();
  const userRole = user?.role || 'sales';
  const { data: orders, isLoading, isError } = useList();

  // Dialog / Modal States
  const [selectedMoId, setSelectedMoId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Capacity Full');
  const [customReason, setCustomReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [machineSelection, setMachineSelection] = useState('Machine CNC-A');
  const [showStartModal, setShowStartModal] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Expanded Rows State — auto-expand the first draft order so PM sees BOM immediately
  const [expandedMoId, setExpandedMoId] = useState<string | null>(null);

  // Track auto-expanded so we only do it once on load
  const [autoExpandDone, setAutoExpandDone] = useState(false);

  const canEdit = userRole === 'admin' || userRole === 'product_manager';

  // Auto-expand BOM for the first pending draft request so PM sees recipe on arrival
  React.useEffect(() => {
    if (!autoExpandDone && orders && orders.length > 0) {
      const firstDraft = orders.find((o: any) => o.status === 'draft');
      if (firstDraft) {
        setExpandedMoId(firstDraft.id);
      }
      setAutoExpandDone(true);
    }
  }, [orders, autoExpandDone]);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-text-secondary text-sm">Loading manufacturing queue...</p>
      </div>
    );
  }

  if (isError || !orders) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="mx-auto text-rose-500" size={40} />
        <h2 className="text-xl font-bold text-brand-primary">Error Loading Queue</h2>
        <p className="text-sm text-text-secondary">Could not fetch manufacturing orders. Verify database connection.</p>
      </div>
    );
  }

  // Calculate PM KPIs
  const activeOrders = orders.filter(o => o.status === 'in_progress');
  const pendingRequests = orders.filter(o => o.status === 'draft');
  const completedOrders = orders.filter(o => o.status === 'completed');
  
  // Simulated stats
  const delayedOrders = activeOrders.filter(o => {
    if (!o.scheduledEnd) return false;
    return new Date(o.scheduledEnd) < new Date();
  });

  const handleApprove = async (id: string) => {
    try {
      setApprovingId(id);
      await approve(id);
    } catch {
      // Toast handles error
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectClick = (id: string) => {
    setSelectedMoId(id);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedMoId) return;
    const finalReason = rejectReason === 'Other' ? customReason : rejectReason;
    if (!finalReason) return;
    try {
      await reject({ id: selectedMoId, reason: finalReason });
      setShowRejectModal(false);
      setSelectedMoId(null);
      setCustomReason('');
    } catch {
      // Toast handles error
    }
  };

  const handleStartClick = (id: string) => {
    setSelectedMoId(id);
    setShowStartModal(true);
  };

  const handleConfirmStart = async () => {
    if (!selectedMoId) return;
    try {
      await start({ id: selectedMoId, machine: machineSelection });
      setShowStartModal(false);
      setSelectedMoId(null);
    } catch {
      // Toast handles error
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await complete(id);
    } catch {
      // Toast handles error
    }
  };

  const toggleRow = (id: string) => {
    setExpandedMoId(expandedMoId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="page-title">Manufacturing Workspace</h1>
        <p className="page-subtitle">Product Manager command center for exploding recipes, starting runs, and tracking machines</p>
      </div>

      {/* Operations Dashboard KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="kpi-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Active MO Runs</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{activeOrders.length}</p>
            <p className="text-[11px] text-emerald-600 mt-1 font-semibold">Running on shop floor</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-[#4B164C]">
            <Hammer size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Pending PM Approvals</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{pendingRequests.length}</p>
            <p className="text-[11px] text-amber-600 mt-1 font-semibold">Awaiting capacity/BOM check</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <ClipboardList size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Delayed MO Runs</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{delayedOrders.length}</p>
            <p className="text-[11px] text-rose-600 mt-1 font-semibold">Overdue schedules</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="kpi-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Efficiency Rating</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">96.8%</p>
            <p className="text-[11px] text-emerald-600 mt-1 font-semibold">OEE standard achieved</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Main MO Table */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-base font-bold text-brand-primary flex items-center gap-2">
          <Layers size={18} />
          Production Scheduler Queue
        </h2>

        {orders.length === 0 ? (
          <Alert variant="info">
            No active manufacturing orders found. Requests are created automatically when confirming sales orders with stockout items.
          </Alert>
        ) : (
          <div className="border border-surface-border rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-surface-card/30 text-text-secondary uppercase">
                <tr className="border-b border-surface-border">
                  <th className="p-4 w-12 text-center">Info</th>
                  <th className="p-4">MO Number</th>
                  <th className="p-4">Product Details</th>
                  <th className="p-4 text-center">Qty to Produce</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border bg-surface-input">
                {orders.map((mo) => {
                  const isExpanded = expandedMoId === mo.id;
                  const progress = mo.status === 'completed' ? 100 : mo.status === 'in_progress' ? 60 : 0;

                  return (
                    <React.Fragment key={mo.id}>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => toggleRow(mo.id)}
                            className={`p-1 rounded text-xs font-bold transition-colors ${
                              isExpanded 
                                ? 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isExpanded ? 'Hide' : 'BOM ↓'}
                          </button>
                        </td>
                        <td className="p-4 font-mono font-bold text-brand-primary">
                          {mo.orderNumber}
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-text-primary text-sm">{mo.product.name}</p>
                          <p className="text-xs text-text-muted">SKU: {mo.product.sku}</p>
                        </td>
                        <td className="p-4 text-center font-bold text-sm">
                          {Number(mo.quantityToProduce)} {mo.product.unitOfMeasure}
                        </td>
                        <td className="p-4 text-text-secondary font-medium">
                          {mo.scheduledEnd ? format(new Date(mo.scheduledEnd), 'MMM d, yyyy') : 'No deadline'}
                        </td>
                        <td className="p-4 text-center">
                          <Badge
                            variant={
                              mo.status === 'draft' ? 'gray' :
                              mo.status === 'WAITING_FOR_PROCUREMENT' ? 'red' :
                              mo.status === 'READY_TO_START' ? 'green' :
                              mo.status === 'confirmed' ? 'blue' :
                              mo.status === 'in_progress' ? 'amber' :
                              mo.status === 'completed' ? 'green' : 'red'
                            }
                          >
                            {mo.status.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                          {mo.status === 'in_progress' && (
                            <div className="w-20 mx-auto mt-1.5 space-y-1">
                              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full animate-pulse" style={{ width: `${progress}%` }} />
                              </div>
                              <p className="text-[9px] font-bold text-amber-600">{progress}% Done</p>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {mo.status === 'draft' && canEdit && (
                              <>
                                <Button 
                                  className="bg-emerald-600 hover:bg-emerald-700 border-0 text-white font-semibold py-1 px-2.5 h-8 flex items-center gap-1"
                                  onClick={() => handleApprove(mo.id)}
                                  isLoading={isApproving && approvingId === mo.id}
                                  disabled={isApproving}
                                >
                                  <Check size={14} /> Approve
                                </Button>
                                <Button 
                                  variant="danger"
                                  className="font-semibold py-1 px-2.5 h-8 flex items-center gap-1"
                                  onClick={() => handleRejectClick(mo.id)}
                                >
                                  <X size={14} /> Reject
                                </Button>
                              </>
                            )}
                            
                            {mo.status === 'READY_TO_START' && canEdit && (
                              <Button 
                                  className="bg-[#4B164C] hover:bg-[#4B164C]/95 border-0 text-white font-semibold py-1 px-3 h-8 flex items-center gap-1.5"
                                  onClick={() => handleStartClick(mo.id)}
                                  isLoading={isStarting}
                                >
                                <Play size={12} fill="white" /> Start Execution
                              </Button>
                            )}

                            {mo.status === 'WAITING_FOR_PROCUREMENT' && canEdit && (
                              <Button 
                                  className="bg-slate-200 border-0 text-slate-400 font-semibold py-1 px-3 h-8 flex items-center gap-1.5 cursor-not-allowed"
                                  disabled
                                >
                                <Lock size={12} /> Start Execution
                              </Button>
                            )}

                            {mo.status === 'in_progress' && canEdit && (
                              <Button 
                                  className="bg-emerald-600 hover:bg-emerald-700 border-0 text-white font-semibold py-1 px-3 h-8 flex items-center gap-1.5"
                                  onClick={() => handleComplete(mo.id)}
                                  isLoading={isCompleting}
                                >
                                <CheckCircle2 size={13} /> Complete
                              </Button>
                            )}

                            {mo.status === 'completed' && (
                              <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                                <Check size={14} /> Done
                              </span>
                            )}
                            {mo.status === 'cancelled' && (
                              <span className="text-rose-500 font-bold text-xs">Rejected</span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable BOM Details */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={7} className="p-4 border-t border-b border-surface-border">
                            <div className="space-y-4 max-w-4xl mx-auto">
                              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                <h4 className="font-bold text-xs text-brand-primary flex items-center gap-1.5">
                                  <ClipboardList size={14} />
                                  Active BOM Recipe: {mo.bom?.name || 'Standard BoM'}
                                </h4>
                                {mo.triggeredBySo && (
                                  <span className="text-[10px] text-text-muted font-bold">
                                    Linked Sales Order: <Link href={`/sales/${mo.triggeredBySoId}`} className="text-[#4B164C] hover:underline font-mono font-bold">{mo.triggeredBySo.orderNumber}</Link>
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Recipe Components Checklist</p>
                                  <div className="space-y-1.5">
                                    {mo.bom?.items?.map((item: any, idx: number) => {
                                      const required = (Number(item.quantity) / Number(mo.bom.quantity)) * Number(mo.quantityToProduce);
                                      const onHand = Number(item.component.onHandQuantity);
                                      const isMissing = onHand < required;

                                      return (
                                        <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded bg-white border border-surface-border shadow-xs">
                                          <div>
                                            <p className="font-bold text-text-primary">{item.component.name}</p>
                                            <p className="text-[10px] text-text-muted">SKU: {item.component.sku}</p>
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <div className="text-right">
                                              <p className="text-text-secondary font-medium">Needed: {required.toFixed(2)} {item.unitOfMeasure}</p>
                                              <p className="text-[10px] text-text-muted">On Hand: {onHand.toFixed(2)}</p>
                                            </div>
                                            {isMissing ? (
                                              <Badge variant="red">Missing</Badge>
                                            ) : (
                                              <Badge variant="green">Available</Badge>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Work Instructions & Notes</p>
                                    <p className="text-xs p-3.5 bg-white border border-surface-border rounded-xl text-text-secondary leading-relaxed whitespace-pre-wrap font-medium">
                                      {mo.notes || 'No notes compiled for this production schedule.'}
                                    </p>
                                  </div>

                                  {mo.status === 'in_progress' && (
                                    <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                                      <h5 className="text-xs font-bold text-amber-600 flex items-center gap-1">
                                        <Cpu size={14} /> Shop Floor telemetry active
                                      </h5>
                                      <p className="text-[11px] text-text-secondary leading-relaxed">
                                        Vibrational monitors locked. Machinery configured to <strong>{machineSelection}</strong> calibration speed. Output tracking live.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-surface-border max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-[#4B164C] flex items-center gap-2">
                <AlertTriangle size={18} /> Reject Production Request
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-text-secondary">Please select a mandatory reason for rejecting this production request. The sales executive will be notified.</p>
              
              <div className="space-y-2">
                {['Capacity Full', 'Material Not Available', 'Deadline Not Feasible', 'Other'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2.5 text-xs font-semibold text-text-secondary cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                    <input 
                      type="radio" 
                      name="rejectReason" 
                      value={opt} 
                      checked={rejectReason === opt}
                      onChange={() => setRejectReason(opt)}
                      className="accent-brand-primary"
                    />
                    {opt}
                  </label>
                ))}
              </div>

              {rejectReason === 'Other' && (
                <textarea
                  className="w-full text-xs p-3 rounded-xl border border-surface-border focus:ring-1 focus:ring-brand-primary focus:outline-none"
                  placeholder="Enter rejection notes..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                />
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
              <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
              <Button 
                variant="danger"
                onClick={handleConfirmReject}
                isLoading={isRejecting}
                disabled={rejectReason === 'Other' && !customReason}
              >
                Reject Request
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Start Execution Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-surface-border max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-surface-border pb-3">
              <h3 className="text-base font-bold text-[#4B164C] flex items-center gap-2">
                <Play size={16} fill="#4B164C" /> Start Production Run
              </h3>
              <button onClick={() => setShowStartModal(false)} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-text-secondary">Starting production will consume all recipe raw materials from inventory. Select the target machine line:</p>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Select Machinery Line</label>
                <select
                  value={machineSelection}
                  onChange={(e) => setMachineSelection(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-surface-border focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
                >
                  <option value="Machine CNC-A">Machine CNC-A (Advanced routing)</option>
                  <option value="Machine L-1">Machine L-1 (Veneering & cutting)</option>
                  <option value="Assembly Line B-4">Assembly Line B-4 (Manual joining)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
              <Button variant="secondary" onClick={() => setShowStartModal(false)}>Cancel</Button>
              <Button 
                className="bg-[#4B164C] hover:bg-[#4B164C]/95 border-0 text-white" 
                onClick={handleConfirmStart}
                isLoading={isStarting}
              >
                Confirm Start
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
