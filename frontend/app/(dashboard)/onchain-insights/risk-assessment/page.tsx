'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Sliders,
  Search,
  Filter,
  Eye,
  RefreshCw,
  FileText,
  Sparkles,
  Info,
  ArrowRight,
  ExternalLink,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  AlertOctagon,
  Scale,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import { DEFAULT_RISK_WEIGHTS } from '@/lib/server/modules/onchain-insights/risk-scoring';
import { RISK_TIER_CONFIG } from '@/types/onchain-insights';
import type {
  SupplierRiskAssessment,
  RiskAssessmentWeights,
  RiskAssessmentFilterParams,
  RiskTier,
} from '@/types/onchain-insights';

export default function RiskAssessmentPage() {
  const { useRiskAssessment } = useOnchainInsights();

  // Filters State
  const [filters, setFilters] = useState<RiskAssessmentFilterParams>({
    tier: 'all',
    horizon: '30_days',
    search: '',
    sortBy: 'riskScore',
    sortOrder: 'desc',
  });

  // Dynamic Custom Weights State (Allows procurement officers to simulate risk tolerances)
  const [weights, setWeights] = useState<RiskAssessmentWeights>({
    delivery: DEFAULT_RISK_WEIGHTS.delivery,
    disruption: DEFAULT_RISK_WEIGHTS.disruption,
    geographic: DEFAULT_RISK_WEIGHTS.geographic,
    financial: DEFAULT_RISK_WEIGHTS.financial,
    compliance: DEFAULT_RISK_WEIGHTS.compliance,
  });

  // Query risk assessment results
  const {
    data: riskResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useRiskAssessment(filters, weights);

  const suppliersList = riskResponse?.data || [];
  const kpis = riskResponse?.kpis || {
    totalSuppliers: 12,
    criticalCount: 2,
    highCount: 3,
    mediumCount: 4,
    lowCount: 3,
    avgRiskScore: 46,
  };

  // Selected Supplier ID for Factor Detail
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('sup-001');

  // Currently Selected Supplier Object
  const selectedSupplier: SupplierRiskAssessment | undefined = useMemo(() => {
    return suppliersList.find(s => s.supplierId === selectedSupplierId) || suppliersList[0];
  }, [suppliersList, selectedSupplierId]);

  // Reset Weights to System Baseline
  const handleResetWeights = () => {
    setWeights({
      delivery: DEFAULT_RISK_WEIGHTS.delivery,
      disruption: DEFAULT_RISK_WEIGHTS.disruption,
      geographic: DEFAULT_RISK_WEIGHTS.geographic,
      financial: DEFAULT_RISK_WEIGHTS.financial,
      compliance: DEFAULT_RISK_WEIGHTS.compliance,
    });
    toast.success('Reset weights to ERP baseline standards.');
  };

  // Recharts Radar Chart Data for Selected Supplier
  const radarData = useMemo(() => {
    if (!selectedSupplier) return [];
    return [
      { subject: 'Delivery Risk', score: selectedSupplier.factors.deliveryRisk, fullMark: 100 },
      { subject: 'Disruption Exposure', score: selectedSupplier.factors.disruptionExposure, fullMark: 100 },
      { subject: 'Geographic Corridor', score: selectedSupplier.factors.geographicRisk, fullMark: 100 },
      { subject: 'Financial Risk', score: selectedSupplier.factors.financialRisk, fullMark: 100 },
      { subject: 'Compliance & Audit', score: selectedSupplier.factors.complianceRisk, fullMark: 100 },
    ];
  }, [selectedSupplier]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !riskResponse) {
    return (
      <div className="p-12 text-center border border-rose-200 bg-rose-50/50 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
        <h3 className="font-bold text-base text-rose-800">Risk Assessment Error</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">
          Could not compute supplier risk prioritization. Please verify data feeds.
        </p>
        <button onClick={() => refetch()} className="btn-primary bg-rose-600 hover:bg-rose-700">
          Retry Scoring
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* ================================================================ */}
      {/* HEADER & TOP CONTROLS */}
      {/* ================================================================ */}
      <div className="bg-white border border-surface-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <Breadcrumbs
              items={[
                { label: 'Onchain Insights', href: '/onchain-insights' },
                { label: 'Risk Prioritization' },
              ]}
            />
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h1 className="page-title text-2xl font-bold tracking-tight text-[#4B164C]">
                Disruption Prediction & Explainable Risk Prioritization
              </h1>
              {/* Mandatory Acceptance Criteria Badge */}
              <Badge className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                <Scale size={11} className="text-purple-600" />
                Rule-Based Assessment (No Black-Box ML)
              </Badge>
            </div>
            <p className="page-subtitle text-xs text-text-muted">
              Deterministic multi-factor vulnerability assessment, horizon exposure modeling, and transparent scoring weights
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                refetch();
                toast.success('Risk models recalculated with active telemetry inputs.');
              }}
              disabled={isFetching}
              className="btn-secondary text-xs px-3.5 py-1.5 gap-1.5"
            >
              <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
              Recalculate
            </button>
            <button
              onClick={() => {
                toast.success('Exported risk priority matrix to executive PDF report.');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4B164C] text-white hover:bg-[#39103a] shadow-sm transition-all"
            >
              <FileText size={13} />
              Export Risk Matrix
            </button>
          </div>
        </div>

        {/* Prediction Horizon Selector Bar */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-text-muted uppercase flex items-center gap-1">
              <Calendar size={13} className="text-[#4B164C]" /> Exposure Horizon:
            </span>
            {(['30_days', '60_days', '90_days'] as const).map((hor) => (
              <button
                key={hor}
                onClick={() => setFilters(prev => ({ ...prev, horizon: hor }))}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                  filters.horizon === hor
                    ? 'bg-[#4B164C] text-white border-[#4B164C] shadow-xs'
                    : 'bg-slate-50 text-text-secondary border-slate-200 hover:bg-slate-100'
                }`}
              >
                {hor === '30_days' ? '30 Days (Immediate)' : hor === '60_days' ? '60 Days (Mid-Term)' : '90 Days (Quarterly)'}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-text-muted">
            Evaluated on: <strong>October 12, 2026</strong> • Coverage: <strong>{kpis.totalSuppliers} Qualified Suppliers</strong>
          </span>
        </div>
      </div>

      {/* ================================================================ */}
      {/* TOP KPI STRIP */}
      {/* ================================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Critical Risk Suppliers */}
        <div className="glass-card p-4 space-y-1 border-t-2 border-t-rose-500">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Critical Risk</span>
            <AlertOctagon size={14} className="text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700 tracking-tight">
            {kpis.criticalCount}
            <span className="text-xs font-normal text-text-muted ml-1.5">
              ({Math.round((kpis.criticalCount / kpis.totalSuppliers) * 100)}%)
            </span>
          </p>
          <p className="text-[10px] text-text-muted">Score ≥ 70 • Action Required</p>
        </div>

        {/* High Risk Suppliers */}
        <div className="glass-card p-4 space-y-1 border-t-2 border-t-orange-500">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">High Risk</span>
            <ShieldAlert size={14} className="text-orange-600" />
          </div>
          <p className="text-2xl font-black text-orange-700 tracking-tight">
            {kpis.highCount}
          </p>
          <p className="text-[10px] text-text-muted">Score 50–69 • Mitigation Priority</p>
        </div>

        {/* Medium Risk Suppliers */}
        <div className="glass-card p-4 space-y-1 border-t-2 border-t-amber-500">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Medium Risk</span>
            <AlertTriangle size={14} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 tracking-tight">
            {kpis.mediumCount}
          </p>
          <p className="text-[10px] text-text-muted">Score 30–49 • Close Monitoring</p>
        </div>

        {/* Low Risk Suppliers */}
        <div className="glass-card p-4 space-y-1 border-t-2 border-t-emerald-500">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Low Risk / Resilient</span>
            <CheckCircle2 size={14} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 tracking-tight">
            {kpis.lowCount}
          </p>
          <p className="text-[10px] text-text-muted">Score &lt; 30 • Reliable Sourcing</p>
        </div>

        {/* Average Network Score */}
        <div className="glass-card p-4 space-y-1 border-t-2 border-t-blue-500">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Network Avg Score</span>
            <Award size={14} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-text-primary tracking-tight">
            {kpis.avgRiskScore}<span className="text-sm font-bold text-text-muted">/100</span>
          </p>
          <p className="text-[10px] text-text-muted">Weighted composite index</p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* MAIN SPLIT-SCREEN WORKSPACE */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================== */}
        {/* LEFT COLUMN: PRIORITIZED SUPPLIER RISK TABLE (7 COLS) */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 glass-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Prioritized Supplier Vulnerability Matrix
              </h3>
              <p className="text-base font-bold text-text-primary mt-0.5">
                Deterministic Vulnerability Ranking
              </p>
            </div>
            <span className="text-[10px] font-bold text-text-muted bg-slate-100 px-2.5 py-1 rounded-full">
              Ranked High to Low
            </span>
          </div>

          {/* Filter / Search Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                placeholder="Filter by supplier name, location or material..."
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="input-field pl-8 pr-3 py-1.5 text-xs w-full h-8 rounded-xl"
              />
            </div>

            {/* Quick Tier Filter */}
            <div className="flex items-center gap-1 text-xs">
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilters(prev => ({ ...prev, tier }))}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    filters.tier === tier
                      ? 'bg-[#4B164C] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-2.5 px-3 font-bold text-text-muted uppercase text-[10px] w-12 text-center">
                    Rank
                  </th>
                  <th className="py-2.5 px-3 font-bold text-text-muted uppercase text-[10px]">
                    Supplier
                  </th>
                  <th className="py-2.5 px-3 font-bold text-text-muted uppercase text-[10px] text-center">
                    Tier
                  </th>
                  <th className="py-2.5 px-3 font-bold text-text-muted uppercase text-[10px]">
                    Risk Score
                  </th>
                  <th className="py-2.5 px-3 font-bold text-text-muted uppercase text-[10px]">
                    Primary Driver
                  </th>
                  <th className="py-2.5 px-3 font-bold text-text-muted uppercase text-[10px] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliersList.map((s) => {
                  const isSelected = selectedSupplier?.supplierId === s.supplierId;
                  const sevCfg = RISK_TIER_CONFIG[s.riskTier];

                  return (
                    <tr
                      key={s.supplierId}
                      onClick={() => setSelectedSupplierId(s.supplierId)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#F8E7F6]/50 font-semibold'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-text-muted text-[11px]">
                        #{s.rank}
                      </td>

                      {/* Name & Location */}
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-text-primary leading-tight">{s.supplierName}</p>
                        <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                          <MapPin size={9} /> {s.location}
                        </p>
                      </td>

                      {/* Tier Badge */}
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${sevCfg.bg} ${sevCfg.color} border ${sevCfg.border}`}>
                          {s.riskTier}
                        </span>
                      </td>

                      {/* Risk Score Progress */}
                      <td className="py-2.5 px-3">
                        <div className="space-y-1 min-w-[90px]">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-mono font-bold text-text-primary">{s.overallRiskScore}</span>
                            <span className="text-[9px] text-text-muted">/100</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                s.overallRiskScore >= 70
                                  ? 'bg-rose-600'
                                  : s.overallRiskScore >= 50
                                  ? 'bg-orange-500'
                                  : s.overallRiskScore >= 30
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${s.overallRiskScore}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Primary Driver */}
                      <td className="py-2.5 px-3 text-[11px] text-text-secondary">
                        <span className="font-medium text-slate-700">{s.primaryRiskDriver}</span>
                        {s.activeDisruptionsCount > 0 && (
                          <span className="ml-1 text-[9px] text-rose-700 font-bold bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                            {s.activeDisruptionsCount} active
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSupplierId(s.supplierId);
                          }}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-all ${
                            isSelected
                              ? 'bg-[#4B164C] text-white shadow-xs'
                              : 'text-[#4B164C] hover:bg-slate-100'
                          }`}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: SELECTED SUPPLIER EXPLAINABLE DETAIL (5 COLS) */}
        {/* ============================================================== */}
        {selectedSupplier && (
          <div className="lg:col-span-5 glass-card p-5 space-y-4">
            {/* Header Identity */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-text-muted">
                    Rank #{selectedSupplier.rank} Priority
                  </span>
                  <h3 className="text-base font-bold text-text-primary leading-tight">
                    {selectedSupplier.supplierName}
                  </h3>
                  <p className="text-[11px] text-text-muted flex items-center gap-1">
                    <MapPin size={10} /> {selectedSupplier.location} ({selectedSupplier.country})
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${RISK_TIER_CONFIG[selectedSupplier.riskTier].bg} ${RISK_TIER_CONFIG[selectedSupplier.riskTier].color} border ${RISK_TIER_CONFIG[selectedSupplier.riskTier].border}`}>
                    {selectedSupplier.riskTier} Risk
                  </span>
                  <p className="text-2xl font-black text-text-primary font-mono tracking-tight">
                    {selectedSupplier.overallRiskScore}<span className="text-xs font-normal text-text-muted">/100</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Radar Chart Factor Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  5-Dimensional Risk Profile Radar
                </h4>
                <span className="text-[10px] text-text-muted">0 (Best) to 100 (Highest Risk)</span>
              </div>

              <div className="h-60 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: '#94a3b8', fontSize: 9 }}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val}/100 Risk Score`, '']}
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    <Radar
                      name={selectedSupplier.supplierName}
                      dataKey="score"
                      stroke={selectedSupplier.overallRiskScore >= 70 ? '#e11d48' : '#4B164C'}
                      fill={selectedSupplier.overallRiskScore >= 70 ? '#f43f5e' : '#4B164C'}
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Plain-Language Explainable Narrative */}
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#4B164C] font-bold">
                <Sparkles size={14} /> Explainable Root-Cause Narrative:
              </div>
              <p className="text-text-secondary leading-relaxed">
                {selectedSupplier.narrativeExplanation}
              </p>
            </div>

            {/* Contributing Root Causes */}
            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-text-muted uppercase text-[10px]">
                Identified Vulnerabilities & Evidence:
              </p>
              <ul className="space-y-1.5">
                {selectedSupplier.contributingRootCauses.map((cause, i) => (
                  <li key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-text-secondary flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold mt-0.5">•</span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Action Plan */}
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1 text-xs">
              <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600" /> Prescribed Mitigation:
              </p>
              <p className="text-emerald-900 leading-relaxed text-[11px]">
                {selectedSupplier.recommendedMitigation}
              </p>
            </div>

            {/* Quick ERP Action Links */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <Link
                href={`/onchain-insights/suppliers/${selectedSupplier.supplierId}`}
                className="btn-secondary text-xs flex-1 justify-center gap-1.5 py-1.5"
              >
                <Eye size={12} /> Full Scorecard
              </Link>
              <Link
                href={`/onchain-insights/supplier-switch?current=${selectedSupplier.supplierId}`}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#4B164C] text-white hover:bg-[#39103a] shadow-xs flex-1 transition-all"
              >
                <ArrowRight size={12} /> Switch Simulator
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* METHODOLOGY DISCLOSURE & SENSITIVITY WEIGHT SIMULATOR */}
      {/* ================================================================ */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-[#4B164C]" />
            <div>
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Transparent Formula Methodology & Weight Sensitivity Simulator
              </h3>
              <p className="text-[11px] text-text-muted">
                Adjust organizational risk weights to simulate procurement stress tolerances
              </p>
            </div>
          </div>

          <button
            onClick={handleResetWeights}
            className="btn-secondary text-xs px-3 py-1 gap-1.5"
          >
            <RefreshCw size={12} /> Reset to Defaults
          </button>
        </div>

        {/* 5 Interactive Weight Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs pt-1">
          {/* Delivery Reliability Weight */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center text-[11px]">
              <label className="font-bold text-text-muted uppercase">Delivery Reliability</label>
              <span className="font-bold text-[#4B164C]">{Math.round(weights.delivery * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.delivery}
              onChange={(e) => setWeights(prev => ({ ...prev, delivery: Number(e.target.value) }))}
              className="w-full accent-[#4B164C] cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <p className="text-[9px] text-text-muted">OTIF, PPM defect rate, lead times</p>
          </div>

          {/* Disruption Exposure Weight */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center text-[11px]">
              <label className="font-bold text-text-muted uppercase">Disruption Exposure</label>
              <span className="font-bold text-[#4B164C]">{Math.round(weights.disruption * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.disruption}
              onChange={(e) => setWeights(prev => ({ ...prev, disruption: Number(e.target.value) }))}
              className="w-full accent-[#4B164C] cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <p className="text-[9px] text-text-muted">Live maritime & plant incidents</p>
          </div>

          {/* Geographic Corridor Weight */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center text-[11px]">
              <label className="font-bold text-text-muted uppercase">Geographic Corridor</label>
              <span className="font-bold text-[#4B164C]">{Math.round(weights.geographic * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.geographic}
              onChange={(e) => setWeights(prev => ({ ...prev, geographic: Number(e.target.value) }))}
              className="w-full accent-[#4B164C] cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <p className="text-[9px] text-text-muted">Cross-border tariffs & port dwell</p>
          </div>

          {/* Financial Stability Weight */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center text-[11px]">
              <label className="font-bold text-text-muted uppercase">Financial Health</label>
              <span className="font-bold text-[#4B164C]">{Math.round(weights.financial * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.financial}
              onChange={(e) => setWeights(prev => ({ ...prev, financial: Number(e.target.value) }))}
              className="w-full accent-[#4B164C] cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <p className="text-[9px] text-text-muted">Balance sheet & payment terms</p>
          </div>

          {/* Compliance & Audit Weight */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center text-[11px]">
              <label className="font-bold text-text-muted uppercase">Compliance & Audit</label>
              <span className="font-bold text-[#4B164C]">{Math.round(weights.compliance * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.compliance}
              onChange={(e) => setWeights(prev => ({ ...prev, compliance: Number(e.target.value) }))}
              className="w-full accent-[#4B164C] cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <p className="text-[9px] text-text-muted">Certifications, audits, ESG</p>
          </div>
        </div>

        {/* Methodology Formula Box */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-text-secondary space-y-1.5">
          <p className="font-bold text-text-primary flex items-center gap-1.5">
            <Info size={14} className="text-[#4B164C]" /> Mathematical Algorithm Disclosure:
          </p>
          <p className="leading-relaxed font-mono text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
            {riskResponse.methodologyDisclosure}
          </p>
          <p className="text-[10px] text-text-muted pt-1">
            * All data is deterministically mapped from active ERP purchase orders, shipment tracking telemetry, and verified certification registries.
          </p>
        </div>
      </div>
    </div>
  );
}
