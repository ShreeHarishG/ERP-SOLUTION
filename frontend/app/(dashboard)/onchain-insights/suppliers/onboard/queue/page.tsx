'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  FileCheck2,
  FileWarning,
  Building2,
  Search,
  Filter,
  RefreshCw,
  X,
  ChevronRight,
  MessageSquare,
  History,
  Send,
  User,
  Shield,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import { ONBOARDING_STAGE_CONFIG } from '@/types/onchain-insights';
import type {
  OnboardingSupplierRecord,
  OnboardingStage,
  DocumentVerificationStatus,
} from '@/types/onchain-insights';

export default function OnboardingReviewQueuePage() {
  const { useOnboardingSuppliers, useReviewOnboarding } = useOnchainInsights();

  // Active filter stage
  const [selectedStage, setSelectedStage] = useState<OnboardingStage | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected supplier for audit review modal
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  // Review decision form state
  const [decisionNotes, setDecisionNotes] = useState('');
  const [reviewerName, setReviewerName] = useState('Priya Sharma (Procurement Lead)');

  // Local doc status overrides during active review
  const [docStatusEdits, setDocStatusEdits] = useState<Record<string, DocumentVerificationStatus>>({});

  // Fetch queue data
  const { data, isLoading, isError, refetch, isFetching } = useOnboardingSuppliers(selectedStage);
  const candidates: OnboardingSupplierRecord[] = data?.data || [];

  const reviewMutation = useReviewOnboarding();

  // Filtered list
  const filteredCandidates = useMemo(() => {
    let list = [...candidates];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.legalName.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.materialsSupplied.some(m => m.toLowerCase().includes(q))
      );
    }
    return list;
  }, [candidates, searchQuery]);

  // Selected candidate object
  const activeCandidate = useMemo(() => {
    return candidates.find(c => c.id === activeReviewId) || null;
  }, [candidates, activeReviewId]);

  // Handle open review modal
  const openReviewModal = (candidate: OnboardingSupplierRecord) => {
    setActiveReviewId(candidate.id);
    setDecisionNotes('');
    const initialDocStatuses: Record<string, DocumentVerificationStatus> = {};
    candidate.documents.forEach(d => {
      initialDocStatuses[d.id] = d.status;
    });
    setDocStatusEdits(initialDocStatuses);
  };

  // Submit decision
  const handleDecisionSubmit = async (decision: 'approve' | 'reject' | 'request_changes') => {
    if (!activeReviewId) return;

    if ((decision === 'reject' || decision === 'request_changes') && !decisionNotes.trim()) {
      toast.error('Please enter review comments explaining the decision.');
      return;
    }

    try {
      const docUpdates = Object.entries(docStatusEdits).map(([docId, status]) => ({
        docId,
        status,
      }));

      await reviewMutation.mutateAsync({
        id: activeReviewId,
        payload: {
          decision,
          reviewerName,
          comments: decisionNotes.trim() || `Supplier status updated to ${decision.toUpperCase()}.`,
          documentStatusUpdates: docUpdates,
        },
      });

      toast.success(`Application decision recorded: ${decision.replace('_', ' ').toUpperCase()}`);
      setActiveReviewId(null);
    } catch (err: any) {
      toast.error('Failed to submit review decision.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center border border-rose-200 bg-rose-50/50 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
        <h3 className="font-bold text-base text-rose-800">Failed to Load Review Queue</h3>
        <button onClick={() => refetch()} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white border border-surface-border p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <Breadcrumbs
            items={[
              { label: 'Onchain Insights', href: '/onchain-insights' },
              { label: 'Suppliers', href: '/onchain-insights/suppliers' },
              { label: 'Onboarding Review Queue' },
            ]}
          />
          <div className="flex items-center gap-3 mt-1">
            <h1 className="page-title text-2xl font-bold tracking-tight text-[#4B164C]">
              Supplier Onboarding Review Queue
            </h1>
            <Badge className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200">
              Audit Governance
            </Badge>
          </div>
          <p className="page-subtitle text-xs text-text-muted">
            Triage new vendor applications, verify statutory and ESG documentation, record audit decisions, and audit timeline logs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/onchain-insights/suppliers/onboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#4B164C] text-white hover:bg-[#380f39] shadow-sm transition-all"
          >
            <UserPlus size={14} />
            Onboard New Supplier
          </Link>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-secondary text-xs px-3 py-2 gap-1.5"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* STAGE FILTER TABS */}
      {/* ================================================================ */}
      <div className="glass-card p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Candidates' },
              { id: 'pending_review', label: 'Pending Review' },
              { id: 'under_audit', label: 'Under Audit' },
              { id: 'changes_requested', label: 'Changes Requested' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStage(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedStage === tab.id
                    ? 'bg-[#4B164C] text-white shadow-xs'
                    : 'bg-slate-50 text-text-secondary hover:bg-slate-100 hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search candidate name, code, material..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field pl-9 py-1 h-8 text-xs w-full"
            />
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* CANDIDATES TABLE */}
      {/* ================================================================ */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between">
          <h3 className="font-bold text-sm text-text-primary">
            Onboarding Applications ({filteredCandidates.length})
          </h3>
          <span className="text-[10px] text-text-muted">
            Click &apos;Review & Audit&apos; to verify documents and record qualification decision
          </span>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <Building2 size={36} className="mx-auto mb-2 text-slate-300" />
            <h4 className="font-bold text-sm text-text-primary">No candidates in this stage</h4>
            <p className="text-xs mt-1">Try selecting a different filter tab or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="erp-table text-xs">
              <thead>
                <tr>
                  <th>Vendor Candidate</th>
                  <th>Location</th>
                  <th>Materials</th>
                  <th className="text-center">Initial Score</th>
                  <th className="text-center">Stage</th>
                  <th className="text-center">Docs Status</th>
                  <th>Assigned Auditor</th>
                  <th>Submitted Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map(supplier => {
                  const stageCfg = ONBOARDING_STAGE_CONFIG[supplier.onboardingStage];
                  const totalDocs = supplier.documents.length;
                  const verifiedDocs = supplier.documents.filter(d => d.status === 'verified').length;
                  const missingDocs = supplier.documents.filter(d => d.status === 'missing' || d.status === 'rejected').length;

                  return (
                    <tr key={supplier.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Code */}
                      <td>
                        <div>
                          <p className="font-bold text-text-primary">{supplier.name}</p>
                          <p className="text-[10px] text-text-muted font-mono">{supplier.code}</p>
                        </div>
                      </td>

                      {/* Location */}
                      <td>
                        <span className="text-text-secondary">{supplier.location}</span>
                      </td>

                      {/* Materials */}
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {supplier.materialsSupplied.map(m => (
                            <span key={m} className="text-[9px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="text-center">
                        <span className="font-bold text-xs px-2 py-0.5 rounded-full bg-slate-100 text-text-primary">
                          {supplier.initialQualificationScore}/100
                        </span>
                      </td>

                      {/* Stage Badge */}
                      <td className="text-center">
                        <Badge variant={stageCfg.badge}>
                          {stageCfg.label}
                        </Badge>
                      </td>

                      {/* Document Compliance Progress */}
                      <td className="text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-[10px] font-bold ${missingDocs > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {verifiedDocs}/{totalDocs} Verified
                          </span>
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${(verifiedDocs / totalDocs) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Assigned Reviewer */}
                      <td>
                        <span className="text-text-secondary text-[11px] truncate max-w-[140px] block">
                          {supplier.assignedReviewer}
                        </span>
                      </td>

                      {/* Submitted Date */}
                      <td className="text-text-muted text-[11px]">
                        {new Date(supplier.submittedAt).toLocaleDateString()}
                      </td>

                      {/* Action */}
                      <td className="text-right">
                        <button
                          onClick={() => openReviewModal(supplier)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#4B164C] text-white hover:bg-[#380f39] transition-all"
                        >
                          Review & Audit
                        </button>
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
      {/* AUDIT REVIEW & DECISION MODAL */}
      {/* ================================================================ */}
      {activeCandidate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-surface-border shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-6 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-text-primary">
                    {activeCandidate.name}
                  </h3>
                  <Badge variant={ONBOARDING_STAGE_CONFIG[activeCandidate.onboardingStage].badge}>
                    {ONBOARDING_STAGE_CONFIG[activeCandidate.onboardingStage].label}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  {activeCandidate.legalName} • {activeCandidate.code} • Tax ID: {activeCandidate.taxId}
                </p>
              </div>

              <button
                onClick={() => setActiveReviewId(null)}
                className="p-1 text-text-muted hover:text-text-primary hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Candidate Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-text-muted uppercase">Initial Score</p>
                <p className="text-xl font-bold text-text-primary mt-0.5">{activeCandidate.initialQualificationScore}/100</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-text-muted uppercase">Monthly Capacity</p>
                <p className="text-xl font-bold text-text-primary mt-0.5">{activeCandidate.operationalDetails.monthlyCapacityUnits.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-text-muted uppercase">Quoted Lead Time</p>
                <p className="text-xl font-bold text-text-primary mt-0.5">{activeCandidate.operationalDetails.quotedLeadTimeDays} days</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-text-muted uppercase">Commercial Terms</p>
                <p className="text-sm font-bold text-text-primary mt-1 truncate">{activeCandidate.operationalDetails.paymentTerms}</p>
              </div>
            </div>

            {/* Document Checklist & Verification Status Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-[#4B164C]" />
                  Document Verification Controls
                </h4>
                <span className="text-[11px] text-text-muted">
                  Auditor: Click buttons below to update validation state
                </span>
              </div>

              <div className="space-y-2.5">
                {activeCandidate.documents.map(doc => {
                  const currentDocStatus = docStatusEdits[doc.id] || doc.status;
                  return (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-text-primary">{doc.name}</span>
                          {doc.isRequired && (
                            <span className="text-[9px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">Required</span>
                          )}
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            currentDocStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                            currentDocStatus === 'rejected' ? 'bg-rose-100 text-rose-800' :
                            currentDocStatus === 'uploaded' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {currentDocStatus}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted">
                          {doc.fileName ? `File: ${doc.fileName} (${doc.fileSize})` : 'No file submitted'}
                          {doc.notes ? ` • Note: ${doc.notes}` : ''}
                        </p>
                      </div>

                      {/* Auditor Verification Toggle Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setDocStatusEdits(p => ({ ...p, [doc.id]: 'verified' }))}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                            currentDocStatus === 'verified'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          onClick={() => setDocStatusEdits(p => ({ ...p, [doc.id]: 'rejected' }))}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                            currentDocStatus === 'rejected'
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                          }`}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <History size={14} className="text-[#4B164C]" />
                Chronological Status History
              </h4>

              <div className="space-y-2 border-l-2 border-slate-200 ml-2 pl-4">
                {activeCandidate.statusHistory.map(hist => (
                  <div key={hist.id} className="relative space-y-0.5 text-xs pb-2">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#4B164C]" />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary">
                        {hist.fromStatus} → {hist.toStatus}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        by {hist.changedBy} on {new Date(hist.changedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary">{hist.reason}</p>
                    {hist.comments && (
                      <p className="text-[10px] text-text-muted italic bg-slate-50 p-1.5 rounded border border-slate-100">
                        &ldquo;{hist.comments}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Remarks & Action Controls */}
            <div className="space-y-3 pt-3 border-t border-surface-border">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-muted uppercase">
                  Auditor Formal Remarks / Reason *
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide audit rationale, conditions of approval, or required resubmission details..."
                  value={decisionNotes}
                  onChange={e => setDecisionNotes(e.target.value)}
                  className="input-field p-2.5 text-xs w-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveReviewId(null)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDecisionSubmit('request_changes')}
                    disabled={reviewMutation.isPending}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-xs"
                  >
                    Request Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecisionSubmit('reject')}
                    disabled={reviewMutation.isPending}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
                  >
                    Reject Application
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecisionSubmit('approve')}
                    disabled={reviewMutation.isPending}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    Approve & Qualify
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
