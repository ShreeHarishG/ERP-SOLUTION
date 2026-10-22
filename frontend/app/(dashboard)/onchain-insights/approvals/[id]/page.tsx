'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  ShieldAlert,
  Send,
  Building2,
  Package,
  Layers,
  RotateCcw,
  Check,
  X,
  History,
  ExternalLink,
  UserCheck,
  Calendar,
  DollarSign,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import {
  APPROVAL_STATUS_CONFIG,
  DECISION_TYPE_LABELS,
  RISK_TIER_CONFIG,
  type ApprovalActionPayload,
} from '@/types/onchain-insights';

interface DecisionReviewPageProps {
  params: Promise<{ id: string }>;
}

export default function DecisionReviewPage({ params }: DecisionReviewPageProps) {
  const { id } = use(params);
  const { useApproval, useActionApproval } = useOnchainInsights();

  const { data: decision, isLoading, isError, refetch } = useApproval(id);
  const actionApprovalMutation = useActionApproval();

  // Reviewer comment state
  const [reviewerComment, setReviewerComment] = useState<string>('');

  const handleExecuteDecision = async (action: 'approve' | 'reject' | 'request_changes') => {
    if (!decision) return;

    if (!reviewerComment.trim()) {
      toast.error('Please specify reviewer audit comments before confirming governance action.');
      return;
    }

    try {
      await actionApprovalMutation.mutateAsync({
        id: decision.id,
        payload: {
          action,
          comments: reviewerComment,
          reviewerName: 'Vikram Mehta',
          reviewerRole: 'VP Global Supply Chain (Executive Approver)',
        },
      });

      toast.success(
        `Decision ${decision.id} successfully updated to ${
          action === 'approve'
            ? 'Approved'
            : action === 'reject'
            ? 'Rejected'
            : 'Changes Requested'
        }!`
      );
      setReviewerComment('');
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record decision.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[600px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (isError || !decision) {
    return (
      <div className="p-12 text-center border border-rose-200 bg-rose-50/50 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
        <h3 className="font-bold text-base text-rose-800">Decision Record Not Found</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">
          Could not locate approval request "{id}" in the governance ledger.
        </p>
        <Link href="/onchain-insights/approvals" className="btn-primary bg-rose-600 hover:bg-rose-700">
          Back to Approvals Queue
        </Link>
      </div>
    );
  }

  const statusCfg = APPROVAL_STATUS_CONFIG[decision.status] || APPROVAL_STATUS_CONFIG.pending_review;
  const riskCfg = RISK_TIER_CONFIG[decision.operationalTradeOffs.residualRisk] || RISK_TIER_CONFIG.low;
  const isPending = decision.status === 'pending_review';

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* ================================================================ */}
      {/* HEADER & NAVIGATION BAR */}
      {/* ================================================================ */}
      <div className="bg-white border border-surface-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <Breadcrumbs
              items={[
                { label: 'Onchain Insights', href: '/onchain-insights' },
                { label: 'Decision & Approvals', href: '/onchain-insights/approvals' },
                { label: decision.id },
              ]}
            />
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h1 className="page-title text-2xl font-bold tracking-tight text-[#4B164C]">
                {decision.title}
              </h1>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                {decision.id}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 ${statusCfg.bg} ${statusCfg.color} border ${statusCfg.border}`}
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
            </div>
            <p className="page-subtitle text-xs text-text-muted">
              Category: <strong className="text-text-primary">{DECISION_TYPE_LABELS[decision.decisionType]}</strong> • Urgency:{' '}
              <span className="font-bold uppercase text-amber-700">{decision.urgency}</span> • Submitted on{' '}
              {new Date(decision.submittedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/onchain-insights/approvals"
              className="btn-secondary text-xs px-3.5 py-1.5 gap-1.5"
            >
              <ArrowLeft size={13} />
              Back to Queue
            </Link>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* TWO-COLUMN WORKSPACE: CONTEXT (2/3) & DECISION ACTIONS (1/3) */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: DETAILED PROPOSAL & AUDIT TRAIL (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Proposal Summary & Rationale Card */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <FileCheck size={16} className="text-[#4B164C]" />
              Executive Proposal & Justification
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-text-secondary leading-relaxed space-y-2">
              <p className="font-semibold text-text-primary text-sm">{decision.summary}</p>
              <div className="pt-2 border-t border-slate-200 text-xs text-text-muted">
                <strong className="text-text-primary">Operational Rationale:</strong> {decision.rationale}
              </div>
            </div>

            {/* Operational Trade-Offs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                <p className="text-[9px] font-bold text-purple-700 uppercase">Financial Cost</p>
                <p className="text-base font-black text-[#4B164C] font-mono mt-0.5">
                  ₹{decision.financialImpactINR.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                <p className="text-[9px] font-bold text-amber-700 uppercase">Recovery Duration</p>
                <p className="text-base font-black text-amber-800 font-mono mt-0.5">
                  {decision.operationalTradeOffs.timeDeltaDays} Days
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <p className="text-[9px] font-bold text-emerald-700 uppercase">Protected Orders</p>
                <p className="text-base font-black text-emerald-800 font-mono mt-0.5">
                  {decision.operationalTradeOffs.ordersImpacted} Orders
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[9px] font-bold text-text-muted uppercase">Residual Risk</p>
                <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase mt-1 ${riskCfg.bg} ${riskCfg.color}`}>
                  {riskCfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Connected Entities Context Card */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Building2 size={16} className="text-[#4B164C]" />
              Upstream Disruption & Sourcing Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {decision.relatedDisruptionTitle && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1">
                    <AlertTriangle size={11} /> Associated Incident
                  </span>
                  <p className="font-bold text-amber-900 leading-snug">
                    {decision.relatedDisruptionTitle}
                  </p>
                  <p className="text-[11px] font-mono text-amber-700">{decision.relatedDisruptionId}</p>
                  <Link
                    href={`/onchain-insights/mitigation`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4B164C] hover:underline pt-1"
                  >
                    <span>View in Scenario Lab</span>
                    <ExternalLink size={11} />
                  </Link>
                </div>
              )}

              {decision.relatedSupplierName && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
                    <Building2 size={11} /> Primary Vendor / SKU
                  </span>
                  <p className="font-bold text-text-primary leading-snug">
                    {decision.relatedSupplierName}
                  </p>
                  {decision.affectedMaterial && (
                    <p className="text-[11px] text-text-secondary">
                      Material: <strong>{decision.affectedMaterial}</strong> ({decision.sku})
                    </p>
                  )}
                  {decision.relatedSupplierId && (
                    <Link
                      href={`/onchain-insights/suppliers/${decision.relatedSupplierId}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4B164C] hover:underline pt-1"
                    >
                      <span>Inspect Vendor Scorecard</span>
                      <ExternalLink size={11} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. Simulated Execution Manifest (Acceptance Criteria: no live PO created) */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Layers size={16} className="text-[#4B164C]" />
                  Simulated Execution Milestones Checklist
                </h3>
                <p className="text-xs text-text-muted">
                  Operational steps to be carried out upon final executive authorization
                </p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold px-2 py-0.5">
                Simulation Mode
              </Badge>
            </div>

            <div className="space-y-2">
              {decision.executionChecklist.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 mt-0.5">
                      #{idx + 1}
                    </span>
                    <p className="text-text-primary font-medium leading-relaxed">{step.step}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted shrink-0 pl-3">
                    {step.responsibleParty}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 text-[11px] text-text-muted flex items-center gap-2">
              <ShieldAlert size={13} className="text-slate-500 shrink-0" />
              <span>
                <strong>ERP Master Data Safety:</strong> Approving this recovery plan records audit compliance into the distributed ledger. Real purchase orders or EDI invoices are never dispatched in mock simulation mode.
              </span>
            </div>
          </div>

          {/* 4. Chronological Audit Trail Timeline */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <History size={16} className="text-[#4B164C]" />
                Chronological Governance History ({decision.auditTrail.length} Events)
              </h3>
              <span className="text-[10px] font-mono text-text-muted font-bold">
                Two-Party Authorization Trail
              </span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {decision.auditTrail.map((entry) => (
                <div key={entry.id} className="relative space-y-1 text-xs">
                  {/* Dot */}
                  <span
                    className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                      entry.action === 'approved'
                        ? 'bg-emerald-600'
                        : entry.action === 'rejected'
                        ? 'bg-rose-600'
                        : entry.action === 'requested_changes'
                        ? 'bg-blue-600'
                        : 'bg-purple-600'
                    }`}
                  />

                  <div className="flex justify-between items-center flex-wrap gap-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-text-primary font-bold">{entry.actorName}</strong>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {entry.actorRole}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(entry.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-text-secondary bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                    <em>"{entry.comment}"</em>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EXECUTIVE ACTION PANEL (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Reviewer Action Card */}
          <div className="glass-card p-6 rounded-2xl space-y-5 border-2 border-[#4B164C]/20 shadow-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-[#4B164C]" />
                <h3 className="text-sm font-bold text-text-primary">
                  Executive Decision Gateway
                </h3>
              </div>
              <p className="text-xs text-text-muted">
                Authorized delegate sign-off panel
              </p>
            </div>

            {/* Stakeholder Identity */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Assigned Approver:</span>
                <strong className="text-text-primary">{decision.assignedApprover.name}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Approver Role:</span>
                <span className="text-text-secondary">{decision.assignedApprover.role}</span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Submitted By:</span>
                <span className="font-semibold text-text-primary">{decision.submittedBy.name}</span>
              </div>
            </div>

            {/* If Already Decided */}
            {!isPending && (
              <div
                className={`p-3.5 rounded-xl text-xs space-y-1 ${
                  decision.status === 'approved'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : decision.status === 'rejected'
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-blue-50 border border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {decision.status === 'approved' ? (
                    <CheckCircle2 size={14} />
                  ) : decision.status === 'rejected' ? (
                    <XCircle size={14} />
                  ) : (
                    <RotateCcw size={14} />
                  )}
                  Decision Resolution Recorded:
                </div>
                {decision.resolutionComments && (
                  <p className="text-[11px] leading-relaxed italic">
                    "{decision.resolutionComments}"
                  </p>
                )}
                {decision.resolutionDate && (
                  <p className="text-[10px] font-mono text-slate-500 pt-1">
                    Recorded on {new Date(decision.resolutionDate).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            )}

            {/* Reviewer Comments Textarea */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-text-primary">
                Executive Comments / Governance Justification:
              </label>
              <textarea
                rows={4}
                value={reviewerComment}
                onChange={(e) => setReviewerComment(e.target.value)}
                placeholder={
                  isPending
                    ? 'Specify rationale, contractual caveats, or requirements before signing off...'
                    : 'Add supplementary follow-up audit note...'
                }
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4B164C]/20 focus:border-[#4B164C] outline-hidden bg-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleExecuteDecision('approve')}
                disabled={actionApprovalMutation.isPending}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50"
              >
                <Check size={14} />
                {actionApprovalMutation.isPending ? 'Recording...' : 'Authorize & Approve Plan'}
              </button>

              <button
                onClick={() => handleExecuteDecision('request_changes')}
                disabled={actionApprovalMutation.isPending}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all disabled:opacity-50"
              >
                <RotateCcw size={14} />
                Request Changes & Re-simulation
              </button>

              <button
                onClick={() => handleExecuteDecision('reject')}
                disabled={actionApprovalMutation.isPending}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all disabled:opacity-50"
              >
                <X size={14} />
                Reject Proposed Action
              </button>
            </div>
          </div>

          {/* Quick Context Links */}
          <div className="glass-card p-5 space-y-3 text-xs">
            <h4 className="font-bold text-text-muted uppercase text-[10px]">
              Cross-Module Verification Links
            </h4>

            <div className="space-y-2">
              <Link
                href="/onchain-insights/mitigation"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-text-primary hover:text-[#4B164C] transition-colors border border-slate-200"
              >
                <span>Re-simulate in Scenario Lab</span>
                <ExternalLink size={12} />
              </Link>

              <Link
                href="/onchain-insights/dependencies"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-text-primary hover:text-[#4B164C] transition-colors border border-slate-200"
              >
                <span>Inspect Multi-Tier Graph</span>
                <ExternalLink size={12} />
              </Link>

              <Link
                href="/onchain-insights/disruptions"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-text-primary hover:text-[#4B164C] transition-colors border border-slate-200"
              >
                <span>View Disruption Incident Log</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
