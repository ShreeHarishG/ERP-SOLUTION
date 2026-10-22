'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Eye,
  ArrowRight,
  ShieldAlert,
  Send,
  Building2,
  RefreshCw,
  RotateCcw,
  UserCheck,
  FileText,
  DollarSign,
  Calendar,
  Layers,
  ChevronRight,
  Check,
  X,
  History,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import {
  APPROVAL_STATUS_CONFIG,
  DECISION_TYPE_LABELS,
  RISK_TIER_CONFIG,
  type ApprovalDecisionItem,
  type ApprovalDecisionStatus,
  type DecisionType,
  type ActionUrgency,
  type ApprovalFilterParams,
} from '@/types/onchain-insights';

export default function ApprovalsQueuePage() {
  const { useApprovals, useActionApproval } = useOnchainInsights();

  // Filter States
  const [statusFilter, setStatusFilter] = useState<ApprovalDecisionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<DecisionType | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<ActionUrgency | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick Action Modal State
  const [quickActionItem, setQuickActionItem] = useState<ApprovalDecisionItem | null>(null);
  const [quickActionType, setQuickActionType] = useState<'approve' | 'reject' | 'request_changes'>('approve');
  const [quickActionComment, setQuickActionComment] = useState<string>('');

  const filterParams: ApprovalFilterParams = useMemo(() => ({
    status: statusFilter,
    decisionType: typeFilter,
    urgency: urgencyFilter,
    search: searchQuery || undefined,
  }), [statusFilter, typeFilter, urgencyFilter, searchQuery]);

  const { data: approvalsResponse, isLoading, isError, refetch } = useApprovals(filterParams);
  const actionApprovalMutation = useActionApproval();

  const items = approvalsResponse?.data || [];
  const kpis = approvalsResponse?.kpis || {
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    changesRequestedCount: 0,
    totalExposureINR: 0,
  };

  // Handle Quick Governance Decision
  const handleExecuteQuickAction = async () => {
    if (!quickActionItem) return;

    try {
      await actionApprovalMutation.mutateAsync({
        id: quickActionItem.id,
        payload: {
          action: quickActionType,
          comments: quickActionComment || `Quick ${quickActionType} executed via approvals queue.`,
        },
      });

      toast.success(
        `Decision ${quickActionItem.id} marked as ${
          quickActionType === 'approve'
            ? 'Approved'
            : quickActionType === 'reject'
            ? 'Rejected'
            : 'Changes Requested'
        }. Audit log updated.`
      );
      setQuickActionItem(null);
      setQuickActionComment('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update governance decision.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center border border-rose-200 bg-rose-50/50 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
        <h3 className="font-bold text-base text-rose-800">Approvals Gateway Error</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">
          Could not load the executive governance queue.
        </p>
        <button onClick={() => refetch()} className="btn-primary bg-rose-600 hover:bg-rose-700">
          Retry Approvals
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* ================================================================ */}
      {/* HEADER & SUMMARY BAR */}
      {/* ================================================================ */}
      <div className="bg-white border border-surface-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <Breadcrumbs
              items={[
                { label: 'Onchain Insights', href: '/onchain-insights' },
                { label: 'Decision & Approvals' },
              ]}
            />
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h1 className="page-title text-2xl font-bold tracking-tight text-[#4B164C]">
                Human Decision & Action Audit Center
              </h1>
              <Badge className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                <FileCheck size={11} className="text-purple-600" />
                Two-Party Governance
              </Badge>
            </div>
            <p className="page-subtitle text-xs text-text-muted">
              Executive gatekeeper for consequential supplier switching, air freight uplifts, buffer depletion, and qualification gates before live ERP execution
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                refetch();
                toast.success('Approvals queue refreshed from governance ledger.');
              }}
              className="btn-secondary text-xs px-3.5 py-1.5 gap-1.5"
            >
              <RefreshCw size={13} />
              Refresh Queue
            </button>
            <Link
              href="/onchain-insights/mitigation"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4B164C] text-white hover:bg-[#39103a] shadow-sm transition-all"
            >
              <Layers size={13} />
              Open Scenario Lab
            </Link>
          </div>
        </div>

        {/* Status Tab Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider shrink-0 mr-1">
            Filter Status:
          </span>
          {[
            { id: 'all', label: 'All Decisions', count: items.length },
            { id: 'pending_review', label: 'Pending Review', count: kpis.pendingCount },
            { id: 'approved', label: 'Approved', count: kpis.approvedCount },
            { id: 'changes_requested', label: 'Changes Requested', count: kpis.changesRequestedCount },
            { id: 'rejected', label: 'Rejected', count: kpis.rejectedCount },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#4B164C] text-white border-[#4B164C] shadow-xs'
                    : 'bg-slate-50 text-text-secondary border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* TOP KPI CARDS */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="glass-card p-4 space-y-1 border-l-4 border-l-amber-500">
          <p className="text-[10px] font-bold text-text-muted uppercase">Pending Executive Reviews</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black text-amber-600 font-mono">
              {kpis.pendingCount} Decisions
            </p>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Immediate: {items.filter((i) => i.status === 'pending_review' && i.urgency === 'immediate').length}
            </span>
          </div>
          <p className="text-[11px] text-text-muted">
            Awaiting authorized sign-off from Supply Chain VP
          </p>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-4 space-y-1 border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-bold text-text-muted uppercase">Approved Recoveries</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-emerald-600 font-mono">
              {kpis.approvedCount}
            </p>
            <span className="text-xs text-text-muted">simulated executions</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            Active purchase amendments verified & audit-logged
          </p>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-4 space-y-1 border-l-4 border-l-blue-500">
          <p className="text-[10px] font-bold text-text-muted uppercase">Changes Requested</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-blue-600 font-mono">
              {kpis.changesRequestedCount}
            </p>
            <span className="text-xs text-text-muted">re-simulations pending</span>
          </div>
          <p className="text-[11px] text-text-muted">
            Returned to procurement with specific condition notes
          </p>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-4 space-y-1 border-l-4 border-l-[#4B164C]">
          <p className="text-[10px] font-bold text-text-muted uppercase">Total Budget Commitment</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-[#4B164C] font-mono">
              ₹{kpis.totalExposureINR.toLocaleString('en-IN')}
            </p>
          </div>
          <p className="text-[11px] text-text-muted">
            Cumulative financial commitment across all logged requests
          </p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* FILTER BAR & SEARCH */}
      {/* ================================================================ */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, title, supplier, material..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-text-primary focus:ring-2 focus:ring-[#4B164C]/20 focus:border-[#4B164C] outline-hidden"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Decision Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-text-secondary outline-hidden"
          >
            <option value="all">All Decision Types</option>
            <option value="mitigation_plan">Disruption Recovery Plan</option>
            <option value="supplier_switch">Supplier Allocation Switch</option>
            <option value="supplier_qualification">Supplier Qualification Gate</option>
            <option value="safety_stock_override">Emergency Buffer Drawdown</option>
          </select>

          {/* Urgency */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value as any)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-text-secondary outline-hidden"
          >
            <option value="all">All Urgency Tiers</option>
            <option value="immediate">Immediate Urgency</option>
            <option value="urgent">Urgent</option>
            <option value="standard">Standard</option>
            <option value="planned">Planned</option>
          </select>

          {/* Clear Filters */}
          {(statusFilter !== 'all' || typeFilter !== 'all' || urgencyFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setUrgencyFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-[#4B164C] hover:underline font-bold px-2 py-1 shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* APPROVAL DECISION TABLE */}
      {/* ================================================================ */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-surface-border">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[#4B164C]" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary">
              Decision Review Queue ({items.length} Records)
            </h3>
          </div>
          <span className="text-[11px] text-text-muted">
            Click on any item or "Review Full Context" to evaluate and record decision
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-text-muted space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
            <p className="font-bold text-sm text-text-primary">No Matching Decisions Found</p>
            <p className="text-xs">Adjust your status or urgency filters to view other logged decisions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold uppercase text-text-muted">
                  <th className="p-3.5 pl-5">Decision ID & Title</th>
                  <th className="p-3.5">Type & Context</th>
                  <th className="p-3.5">Financial Impact</th>
                  <th className="p-3.5">Urgency</th>
                  <th className="p-3.5">Submitter & Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((decision) => {
                  const statusCfg = APPROVAL_STATUS_CONFIG[decision.status] || APPROVAL_STATUS_CONFIG.pending_review;
                  const isImmediate = decision.urgency === 'immediate';
                  const isUrgent = decision.urgency === 'urgent';

                  return (
                    <tr
                      key={decision.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* ID & Title */}
                      <td className="p-3.5 pl-5 max-w-[280px]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                            {decision.id}
                          </span>
                          {isImmediate && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase bg-rose-100 text-rose-800 animate-pulse">
                              Immediate Action
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/onchain-insights/approvals/${decision.id}`}
                          className="font-bold text-text-primary group-hover:text-[#4B164C] line-clamp-2 leading-snug"
                        >
                          {decision.title}
                        </Link>
                      </td>

                      {/* Type & Context */}
                      <td className="p-3.5">
                        <p className="font-semibold text-text-primary">
                          {DECISION_TYPE_LABELS[decision.decisionType]}
                        </p>
                        {decision.relatedSupplierName && (
                          <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
                            <Building2 size={11} /> {decision.relatedSupplierName}
                          </p>
                        )}
                        {decision.affectedMaterial && (
                          <p className="text-[10px] text-slate-400 font-mono">
                            {decision.affectedMaterial}
                          </p>
                        )}
                      </td>

                      {/* Financial Impact */}
                      <td className="p-3.5">
                        <p className="font-mono font-bold text-sm text-[#4B164C]">
                          ₹{decision.financialImpactINR.toLocaleString('en-IN')}
                        </p>
                        {decision.revenueProtectedINR && (
                          <p className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                            Protects ₹{decision.revenueProtectedINR.toLocaleString('en-IN')}
                          </p>
                        )}
                      </td>

                      {/* Urgency */}
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isImmediate
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isUrgent
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {decision.urgency}
                        </span>
                      </td>

                      {/* Submitter & Date */}
                      <td className="p-3.5 text-text-secondary">
                        <p className="font-semibold text-text-primary text-xs">
                          {decision.submittedBy.name}
                        </p>
                        <p className="text-[10px] text-text-muted">{decision.submittedBy.role}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {new Date(decision.submittedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 w-fit ${statusCfg.bg} ${statusCfg.color} border ${statusCfg.border}`}
                        >
                          {decision.status === 'approved' ? (
                            <CheckCircle2 size={11} />
                          ) : decision.status === 'rejected' ? (
                            <XCircle size={11} />
                          ) : decision.status === 'changes_requested' ? (
                            <RotateCcw size={11} />
                          ) : (
                            <Clock size={11} />
                          )}
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {decision.status === 'pending_review' ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQuickActionItem(decision);
                                  setQuickActionType('approve');
                                  setQuickActionComment('Approved without reservation. Executive authorization recorded.');
                                }}
                                title="Quick Approve"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQuickActionItem(decision);
                                  setQuickActionType('request_changes');
                                  setQuickActionComment('Requires revised freight quote or dual-source allocation ratio.');
                                }}
                                title="Request Changes"
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                              >
                                <RotateCcw size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQuickActionItem(decision);
                                  setQuickActionType('reject');
                                  setQuickActionComment('Budget allocation rejected due to SLA and ROI thresholds.');
                                }}
                                title="Quick Reject"
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : null}

                          <Link
                            href={`/onchain-insights/approvals/${decision.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#F8E7F6] text-[#4B164C] transition-colors"
                            title="Inspect Full Context"
                          >
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* GLOBAL AUDIT TRAIL STREAM PANEL */}
      {/* ================================================================ */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <History size={16} className="text-[#4B164C]" />
              Supply Chain Decision Audit Timeline
            </h3>
            <p className="text-xs text-text-muted">
              Immutable ledger trail recording all human approval, rejection, and change requests across ERP procurement
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
            Audit Ledger Active
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {items
            .flatMap((i) =>
              i.auditTrail.map((entry) => ({
                ...entry,
                decisionId: i.id,
                decisionTitle: i.title,
              }))
            )
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5)
            .map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    entry.action === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : entry.action === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : entry.action === 'requested_changes'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {entry.action === 'approved' ? (
                    <CheckCircle2 size={14} />
                  ) : entry.action === 'rejected' ? (
                    <XCircle size={14} />
                  ) : entry.action === 'requested_changes' ? (
                    <RotateCcw size={14} />
                  ) : (
                    <FileText size={14} />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-start flex-wrap gap-1">
                    <div>
                      <strong className="text-text-primary font-semibold">{entry.actorName}</strong>{' '}
                      <span className="text-text-muted">({entry.actorRole})</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(entry.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-text-secondary leading-relaxed">
                    Action on <span className="font-semibold text-text-primary">{entry.decisionId}</span>:{' '}
                    <em>"{entry.comment}"</em>
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* QUICK ACTION GOVERNANCE MODAL */}
      {/* ================================================================ */}
      <Modal
        isOpen={Boolean(quickActionItem)}
        onClose={() => setQuickActionItem(null)}
        title={`Execute Governance Decision: ${quickActionItem?.id}`}
        size="md"
      >
        {quickActionItem && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase">Proposal Context</span>
              <h4 className="font-bold text-text-primary text-sm">{quickActionItem.title}</h4>
              <p className="text-text-muted font-mono">
                Financial Impact: <strong>₹{quickActionItem.financialImpactINR.toLocaleString('en-IN')}</strong>
              </p>
            </div>

            {/* Decision Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-text-primary">Select Governance Action:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setQuickActionType('approve')}
                  className={`p-2 rounded-xl border text-center font-bold transition-all ${
                    quickActionType === 'approve'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Approve Plan
                </button>
                <button
                  type="button"
                  onClick={() => setQuickActionType('request_changes')}
                  className={`p-2 rounded-xl border text-center font-bold transition-all ${
                    quickActionType === 'request_changes'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Request Changes
                </button>
                <button
                  type="button"
                  onClick={() => setQuickActionType('reject')}
                  className={`p-2 rounded-xl border text-center font-bold transition-all ${
                    quickActionType === 'reject'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Reject Plan
                </button>
              </div>
            </div>

            {/* Justification Comment */}
            <div className="space-y-1">
              <label className="font-bold text-text-primary">Reviewer Audit Justification:</label>
              <textarea
                rows={3}
                value={quickActionComment}
                onChange={(e) => setQuickActionComment(e.target.value)}
                placeholder="Enter mandatory governance reasoning for this decision..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4B164C]/20 focus:border-[#4B164C] outline-hidden"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
              <ShieldAlert size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                Simulated governance execution: This action updates internal records and appends to the audit trail without creating real ERP purchase orders.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setQuickActionItem(null)} className="btn-secondary text-xs">
                Cancel
              </button>
              <button
                onClick={handleExecuteQuickAction}
                disabled={actionApprovalMutation.isPending}
                className="btn-primary text-xs"
              >
                {actionApprovalMutation.isPending ? 'Recording Decision...' : 'Confirm Decision'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
