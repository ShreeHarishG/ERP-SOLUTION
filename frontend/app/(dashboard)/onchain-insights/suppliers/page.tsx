'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Info,
  Scale,
  X,
  FileWarning,
  Sparkles,
  BarChart2,
  RefreshCw,
  Award,
  UserPlus,
} from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import {
  RISK_TIER_CONFIG,
  QUALIFICATION_STATUS_CONFIG,
  CERTIFICATION_STATUS_CONFIG,
} from '@/types/onchain-insights';
import type {
  SupplierDetail,
  SupplierFilterParams,
  RiskTier,
  QualificationStatus,
} from '@/types/onchain-insights';

export default function SupplierQualificationPage() {
  const { useSuppliers } = useOnchainInsights();

  // Filters state
  const [filters, setFilters] = useState<SupplierFilterParams>({
    search: '',
    riskTier: 'all',
    qualificationStatus: 'all',
    country: 'all',
    sortBy: 'overallScore',
    sortOrder: 'desc',
  });

  // Comparison selection (IDs)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  // Fetch data
  const { data, isLoading, isError, refetch, isFetching } = useSuppliers(filters);
  const suppliers: SupplierDetail[] = data?.data || [];

  // Toggle supplier for comparison
  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id]; // Keep maximum 3
      }
      return [...prev, id];
    });
  };

  // Compare suppliers data
  const comparedSuppliers = useMemo(() => {
    return suppliers.filter((s) => selectedForCompare.includes(s.id));
  }, [suppliers, selectedForCompare]);

  // Unique countries for filter
  const countries = useMemo(() => {
    const list = new Set(suppliers.map((s) => s.country).filter(Boolean));
    return Array.from(list);
  }, [suppliers]);

  // Statistics
  const stats = useMemo(() => {
    const total = suppliers.length;
    const qualified = suppliers.filter((s) => s.qualificationStatus === 'qualified').length;
    const conditional = suppliers.filter((s) => s.qualificationStatus === 'conditional').length;
    const underReview = suppliers.filter((s) => s.qualificationStatus === 'under_review').length;
    const atRisk = suppliers.filter((s) => s.riskTier === 'critical' || s.riskTier === 'high').length;
    const withWarnings = suppliers.filter((s) => s.missingDataWarnings && s.missingDataWarnings.length > 0).length;
    return { total, qualified, conditional, underReview, atRisk, withWarnings };
  }, [suppliers]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-80" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center border border-rose-200 bg-rose-50/50 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
        <h3 className="font-bold text-base text-rose-800">Failed to Load Suppliers</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">
          Could not fetch supplier qualification data. Please check your network connection.
        </p>
        <button onClick={() => refetch()} className="btn-primary bg-rose-600 hover:bg-rose-700">
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
              { label: 'Supplier Qualification' },
            ]}
          />
          <div className="flex items-center gap-3 mt-1">
            <h1 className="page-title text-2xl font-bold tracking-tight text-[#4B164C]">
              Supplier Qualification Workspace
            </h1>
            <Badge className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
              Evaluation & Scoring
            </Badge>
          </div>
          <p className="page-subtitle text-xs text-text-muted">
            Transparent multi-criteria qualification, risk assessment, and side-by-side supplier benchmarking
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {selectedForCompare.length > 0 && (
            <button
              onClick={() => setComparisonModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#4B164C] text-white shadow-sm hover:bg-[#3d123e] transition-all"
            >
              <Scale size={13} />
              Compare ({selectedForCompare.length}/3)
            </button>
          )}

          <Link
            href="/onchain-insights/suppliers/onboard/queue"
            className="btn-secondary text-xs px-3 py-1.5 gap-1.5"
          >
            Review Queue
          </Link>

          <Link
            href="/onchain-insights/suppliers/onboard"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4B164C] text-white hover:bg-[#39103a] shadow-sm transition-all"
          >
            <UserPlus size={13} />
            Onboard Supplier
          </Link>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-secondary text-xs px-2.5 py-1.5 gap-1"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* STATS STRIP */}
      {/* ================================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="kpi-card p-4">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Suppliers</p>
          <p className="text-xl font-bold text-text-primary mt-1">{stats.total}</p>
          <p className="text-[9px] text-text-muted font-medium mt-0.5">In qualification registry</p>
        </div>

        <div className="kpi-card p-4">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Fully Qualified</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{stats.qualified}</p>
          <p className="text-[9px] text-emerald-600 font-medium mt-0.5">Approved production vendors</p>
        </div>

        <div className="kpi-card p-4">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Conditional</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{stats.conditional}</p>
          <p className="text-[9px] text-amber-600 font-medium mt-0.5">Approved with monitoring</p>
        </div>

        <div className="kpi-card p-4">
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Under Review</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{stats.underReview}</p>
          <p className="text-[9px] text-blue-600 font-medium mt-0.5">Active audit / testing</p>
        </div>

        <div className="kpi-card p-4">
          <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">High Risk</p>
          <p className="text-xl font-bold text-rose-600 mt-1">{stats.atRisk}</p>
          <p className="text-[9px] text-rose-600 font-medium mt-0.5">Critical or High risk tier</p>
        </div>

        <div className="kpi-card p-4">
          <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Verification Alerts</p>
          <p className="text-xl font-bold text-orange-600 mt-1">{stats.withWarnings}</p>
          <p className="text-[9px] text-orange-600 font-medium mt-0.5">Missing certs or reports</p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* TRANSPARENT SCORING METHODOLOGY NOTICE */}
      {/* ================================================================ */}
      <div className="bg-[#F8E7F6]/40 border border-[#4B164C]/15 rounded-xl p-3.5 flex items-start gap-3 text-xs">
        <Info size={16} className="text-[#4B164C] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#4B164C]">
            Transparent Qualification Scoring Methodology
          </p>
          <p className="text-text-secondary leading-relaxed text-[11px]">
            Scores are strictly deterministic based on:
            <strong className="text-text-primary font-semibold"> Delivery Reliability (25%)</strong>,
            <strong className="text-text-primary font-semibold"> Quality & Defect PPM (25%)</strong>,
            <strong className="text-text-primary font-semibold"> Lead Time (15%)</strong>,
            <strong className="text-text-primary font-semibold"> Capacity Utilization (15%)</strong>,
            <strong className="text-text-primary font-semibold"> Financial Stability (10%)</strong>, and
            <strong className="text-text-primary font-semibold"> Verified Compliance/Certifications (10%)</strong>.
            Missing documentation directly reduces compliance points and triggers verification warnings.
          </p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* FILTERS & SEARCH BAR */}
      {/* ================================================================ */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 min-w-[260px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by supplier name, material, code, contact..."
              value={filters.search || ''}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="input-field pl-9 py-1.5 h-9 text-xs w-full"
            />
            {filters.search && (
              <button
                onClick={() => setFilters((f) => ({ ...f, search: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Risk Tier */}
            <select
              value={filters.riskTier || 'all'}
              onChange={(e) => setFilters((f) => ({ ...f, riskTier: e.target.value as any }))}
              className="input-field py-1 px-2.5 h-9 text-xs w-36 font-medium"
            >
              <option value="all">All Risk Tiers</option>
              <option value="critical">🔴 Critical Risk</option>
              <option value="high">🟠 High Risk</option>
              <option value="medium">🟡 Medium Risk</option>
              <option value="low">🟢 Low Risk</option>
            </select>

            {/* Qualification Status */}
            <select
              value={filters.qualificationStatus || 'all'}
              onChange={(e) => setFilters((f) => ({ ...f, qualificationStatus: e.target.value as any }))}
              className="input-field py-1 px-2.5 h-9 text-xs w-40 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="qualified">Qualified</option>
              <option value="conditional">Conditional</option>
              <option value="under_review">Under Review</option>
              <option value="disqualified">Disqualified</option>
            </select>

            {/* Country */}
            <select
              value={filters.country || 'all'}
              onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value }))}
              className="input-field py-1 px-2.5 h-9 text-xs w-32 font-medium"
            >
              <option value="all">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Sort by */}
            <select
              value={filters.sortBy || 'overallScore'}
              onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as any }))}
              className="input-field py-1 px-2.5 h-9 text-xs w-36 font-medium"
            >
              <option value="overallScore">Sort: Score</option>
              <option value="riskScore">Sort: Risk</option>
              <option value="delivery">Sort: Delivery</option>
              <option value="leadTime">Sort: Lead Time</option>
              <option value="name">Sort: Name</option>
            </select>

            {/* Sort Order Toggle */}
            <button
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  sortOrder: f.sortOrder === 'asc' ? 'desc' : 'asc',
                }))
              }
              title={`Sorting ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              className="p-2 border border-surface-border rounded-lg bg-white hover:bg-slate-50 text-text-secondary transition-colors"
            >
              <ArrowUpDown size={14} className={filters.sortOrder === 'asc' ? 'rotate-180' : ''} />
            </button>

            {/* Reset */}
            {(filters.search ||
              filters.riskTier !== 'all' ||
              filters.qualificationStatus !== 'all' ||
              filters.country !== 'all') && (
              <button
                onClick={() =>
                  setFilters({
                    search: '',
                    riskTier: 'all',
                    qualificationStatus: 'all',
                    country: 'all',
                    sortBy: 'overallScore',
                    sortOrder: 'desc',
                  })
                }
                className="text-xs font-bold text-brand-primary hover:underline px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SUPPLIERS DATA TABLE */}
      {/* ================================================================ */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-text-primary">Suppliers Directory</h3>
            <span className="text-[10px] font-bold text-text-muted bg-slate-100 px-2 py-0.5 rounded-full">
              {suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''}
            </span>
          </div>

          <p className="text-[11px] text-text-muted">
            Select up to 3 suppliers to compare side-by-side
          </p>
        </div>

        {suppliers.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <Building2 size={36} className="mx-auto mb-2 text-slate-300" />
            <h4 className="font-bold text-sm text-text-primary">No suppliers matched your filters</h4>
            <p className="text-xs mt-1">Try clearing search terms or selecting different filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="erp-table text-xs">
              <thead>
                <tr>
                  <th className="w-10 text-center">Compare</th>
                  <th>Supplier / Code</th>
                  <th>Location</th>
                  <th>Materials Supplied</th>
                  <th className="text-center">Qual. Score</th>
                  <th className="text-center">Risk Tier</th>
                  <th className="text-center">Delivery Rate</th>
                  <th className="text-center">Avg Lead Time</th>
                  <th className="text-center">Status</th>
                  <th>Verification Alerts</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => {
                  const isSelected = selectedForCompare.includes(s.id);
                  const statusCfg = QUALIFICATION_STATUS_CONFIG[s.qualificationStatus];
                  const riskCfg = RISK_TIER_CONFIG[s.riskTier];
                  const hasWarnings = s.missingDataWarnings && s.missingDataWarnings.length > 0;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-[#F8E7F6]/20' : ''
                      }`}
                    >
                      {/* Checkbox for comparison */}
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCompare(s.id)}
                          className="rounded border-slate-300 text-brand-primary focus:ring-[#4B164C] cursor-pointer"
                        />
                      </td>

                      {/* Name & Code */}
                      <td>
                        <div>
                          <Link
                            href={`/onchain-insights/suppliers/${s.id}`}
                            className="font-bold text-text-primary hover:text-brand-primary hover:underline"
                          >
                            {s.name}
                          </Link>
                          <p className="text-[10px] font-mono text-text-muted">{s.code}</p>
                        </div>
                      </td>

                      {/* Location */}
                      <td>
                        <span className="text-text-secondary">{s.location}</span>
                      </td>

                      {/* Materials */}
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {s.materialsSupplied.slice(0, 2).map((m) => (
                            <span
                              key={m}
                              className="text-[9px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                            >
                              {m}
                            </span>
                          ))}
                          {s.materialsSupplied.length > 2 && (
                            <span className="text-[9px] text-text-muted font-semibold">
                              +{s.materialsSupplied.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Qualification Score */}
                      <td className="text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              s.qualificationScore.overall >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : s.qualificationScore.overall >= 65
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {s.qualificationScore.overall}/100
                          </span>
                        </div>
                      </td>

                      {/* Risk Tier */}
                      <td className="text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${riskCfg.bg} ${riskCfg.color} border ${riskCfg.border}`}
                        >
                          {riskCfg.label}
                        </span>
                      </td>

                      {/* Delivery Rate */}
                      <td className="text-center font-semibold">
                        <span
                          className={
                            s.onTimeDeliveryRate >= 95
                              ? 'text-emerald-600'
                              : s.onTimeDeliveryRate >= 85
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }
                        >
                          {s.onTimeDeliveryRate}%
                        </span>
                      </td>

                      {/* Lead Time */}
                      <td className="text-center font-semibold text-text-secondary">
                        {s.averageLeadTimeDays} days
                      </td>

                      {/* Status */}
                      <td className="text-center">
                        <Badge variant={statusCfg.badge}>
                          {statusCfg.label}
                        </Badge>
                      </td>

                      {/* Warnings / Missing Data */}
                      <td>
                        {hasWarnings ? (
                          <div
                            className="flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200"
                            title={s.missingDataWarnings?.join('; ')}
                          >
                            <FileWarning size={12} className="shrink-0 text-amber-600" />
                            <span className="truncate max-w-[160px]">
                              {s.missingDataWarnings![0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 size={11} /> Verified
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="text-right">
                        <Link
                          href={`/onchain-insights/suppliers/${s.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-hover"
                        >
                          Details
                          <ChevronRight size={13} />
                        </Link>
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
      {/* FLOATING COMPARISON BAR (WHEN 1+ SELECTED) */}
      {/* ================================================================ */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white border border-[#4B164C]/30 shadow-2xl rounded-2xl px-5 py-3.5 flex items-center gap-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-[#4B164C]" />
            <div>
              <p className="text-xs font-bold text-text-primary">
                {selectedForCompare.length} Supplier{selectedForCompare.length !== 1 ? 's' : ''} Selected for Comparison
              </p>
              <p className="text-[10px] text-text-muted">
                {selectedForCompare.length < 2
                  ? 'Select at least 2 suppliers to compare'
                  : 'Ready to evaluate metrics side-by-side'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedForCompare([])}
              className="text-xs text-text-muted hover:text-text-primary px-2"
            >
              Clear
            </button>
            <button
              onClick={() => setComparisonModalOpen(true)}
              disabled={selectedForCompare.length < 2}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedForCompare.length >= 2
                  ? 'bg-[#4B164C] text-white hover:bg-[#3b123d] shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Scale size={14} />
              Compare Now
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MULTI-SUPPLIER COMPARISON MODAL */}
      {/* ================================================================ */}
      {comparisonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-surface-border shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Scale size={20} className="text-[#4B164C]" />
                  <h3 className="text-lg font-bold text-text-primary">
                    Supplier Side-by-Side Comparison Workspace
                  </h3>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Evaluate trade-offs between delivery reliability, defect PPM, lead times, capacity, and risk tiers
                </p>
              </div>
              <button
                onClick={() => setComparisonModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparedSuppliers.map((supplier) => {
                const qs = supplier.qualificationScore;
                const riskCfg = RISK_TIER_CONFIG[supplier.riskTier];
                const statusCfg = QUALIFICATION_STATUS_CONFIG[supplier.qualificationStatus];

                return (
                  <div
                    key={supplier.id}
                    className="border border-surface-border rounded-xl p-4 bg-slate-50/40 space-y-4 relative"
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <Badge variant={statusCfg.badge}>
                          {statusCfg.label}
                        </Badge>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${riskCfg.bg} ${riskCfg.color} border ${riskCfg.border}`}
                        >
                          {riskCfg.label} Risk
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-text-primary leading-tight">
                        {supplier.name}
                      </h4>
                      <p className="text-[10px] text-text-muted font-mono">{supplier.code} • {supplier.location}</p>
                    </div>

                    {/* Overall Score */}
                    <div className="p-3 bg-white border border-slate-100 rounded-xl text-center space-y-1">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        Overall Qualification Score
                      </p>
                      <p className={`text-3xl font-bold ${
                        qs.overall >= 80 ? 'text-emerald-600' :
                        qs.overall >= 65 ? 'text-amber-600' :
                        'text-rose-600'
                      }`}>
                        {qs.overall}<span className="text-sm text-text-muted">/100</span>
                      </p>
                    </div>

                    {/* Score Dimensions Breakdown */}
                    <div className="space-y-2 text-xs">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        Scoring Dimensions
                      </p>

                      <div>
                        <div className="flex justify-between text-[11px] font-medium mb-1">
                          <span className="text-text-secondary">Delivery Reliability (25%)</span>
                          <span className="font-bold text-text-primary">{qs.deliveryReliability}/100</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${qs.deliveryReliability}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-medium mb-1">
                          <span className="text-text-secondary">Quality & Defect PPM (25%)</span>
                          <span className="font-bold text-text-primary">{qs.qualityRating}/100</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${qs.qualityRating}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-medium mb-1">
                          <span className="text-text-secondary">Lead Time Score (15%)</span>
                          <span className="font-bold text-text-primary">{qs.leadTimeScore}/100</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${qs.leadTimeScore}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-medium mb-1">
                          <span className="text-text-secondary">Capacity & Scale (15%)</span>
                          <span className="font-bold text-text-primary">{qs.capacityScore}/100</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${qs.capacityScore}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-medium mb-1">
                          <span className="text-text-secondary">Financial Stability (10%)</span>
                          <span className="font-bold text-text-primary">{qs.financialStability}/100</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${qs.financialStability}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-medium mb-1">
                          <span className="text-text-secondary">Compliance & ESG (10%)</span>
                          <span className="font-bold text-text-primary">{qs.complianceScore}/100</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${qs.complianceScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Operational Metrics */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-text-muted">On-Time Delivery:</span>
                        <span className="font-bold text-text-primary">{supplier.onTimeDeliveryRate}%</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-text-muted">Defect PPM:</span>
                        <span className="font-bold text-text-primary">{supplier.defectRatePpm} ppm</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-text-muted">Avg Lead Time:</span>
                        <span className="font-bold text-text-primary">{supplier.averageLeadTimeDays} days</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-text-muted">Capacity Util:</span>
                        <span className="font-bold text-text-primary">{supplier.capacityUtilizationRate}%</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-text-muted">Payment Terms:</span>
                        <span className="font-medium text-text-primary truncate">{supplier.paymentTerms}</span>
                      </div>
                    </div>

                    {/* Warning banners */}
                    {supplier.missingDataWarnings && supplier.missingDataWarnings.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-[10px] text-amber-800 space-y-1">
                        <p className="font-bold flex items-center gap-1">
                          <FileWarning size={12} /> Verification Flag
                        </p>
                        <p>{supplier.missingDataWarnings[0]}</p>
                      </div>
                    )}

                    {/* Profile Link */}
                    <Link
                      href={`/onchain-insights/suppliers/${supplier.id}`}
                      className="block w-full text-center py-2 px-3 rounded-lg text-xs font-bold bg-white border border-slate-200 text-brand-primary hover:bg-slate-50 transition-colors"
                    >
                      View Full Profile
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
              <button
                onClick={() => setComparisonModalOpen(false)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
