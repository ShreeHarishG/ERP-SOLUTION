'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeftRight,
  Scale,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sliders,
  DollarSign,
  Clock,
  Sparkles,
  RefreshCw,
  FileText,
  Send,
  HelpCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import { DEFAULT_SWITCH_PAIRS } from '@/lib/mock-data/onchain-insights/switching';
import { RISK_TIER_CONFIG } from '@/types/onchain-insights';
import type {
  SwitchSimulatorParams,
  ScenarioImpactMetrics,
  RiskTier,
} from '@/types/onchain-insights';

export default function SupplierSwitchPage() {
  const searchParams = useSearchParams();
  const initialCurrentId = searchParams.get('current');

  const { useSuppliers, useSupplierSwitch } = useOnchainInsights();
  const { data: suppliersData } = useSuppliers();
  const suppliers = suppliersData?.data || [];

  // Active Simulation Parameters State
  const [params, setParams] = useState<SwitchSimulatorParams>(() => {
    const pair = DEFAULT_SWITCH_PAIRS.find(p => p.currentSupplierId === initialCurrentId) || DEFAULT_SWITCH_PAIRS[0];
    return {
      currentSupplierId: initialCurrentId || pair.currentSupplierId,
      alternativeSupplierId: pair.alternativeSupplierId,
      materialName: pair.materialName,
      annualVolume: pair.annualVolume,
      currentUnitCost: pair.currentUnitCost,
      alternativeUnitCost: pair.alternativeUnitCost,
      splitRatioCurrent: pair.splitRatioCurrent,
      switchingCostOneTime: pair.switchingCostOneTime,
      transitionWeeks: pair.transitionWeeks,
    };
  });

  // Fetch simulation calculation
  const { data: simData, isLoading, isError, refetch, isFetching } = useSupplierSwitch(params);

  // Apply a quick preset
  const applyPreset = (presetIndex: number) => {
    const preset = DEFAULT_SWITCH_PAIRS[presetIndex];
    if (preset) {
      setParams({
        currentSupplierId: preset.currentSupplierId,
        alternativeSupplierId: preset.alternativeSupplierId,
        materialName: preset.materialName,
        annualVolume: preset.annualVolume,
        currentUnitCost: preset.currentUnitCost,
        alternativeUnitCost: preset.alternativeUnitCost,
        splitRatioCurrent: preset.splitRatioCurrent,
        switchingCostOneTime: preset.switchingCostOneTime,
        transitionWeeks: preset.transitionWeeks,
      });
      toast.success(`Loaded preset: ${preset.materialName}`);
    }
  };

  // Recharts Cost Comparison Data
  const costChartData = useMemo(() => {
    if (!simData?.scenarios) return [];
    const { retain, split, switch: sw } = simData.scenarios;
    return [
      {
        scenario: 'Retain (100%)',
        materialCost: retain.annualMaterialCost,
        transitionCost: retain.oneTimeTransitionCost,
        totalCost: retain.totalFirstYearCost,
      },
      {
        scenario: `Dual-Source (${params.splitRatioCurrent}% / ${100 - params.splitRatioCurrent}%)`,
        materialCost: split.annualMaterialCost,
        transitionCost: split.oneTimeTransitionCost,
        totalCost: split.totalFirstYearCost,
      },
      {
        scenario: 'Full Switch (100%)',
        materialCost: sw.annualMaterialCost,
        transitionCost: sw.oneTimeTransitionCost,
        totalCost: sw.totalFirstYearCost,
      },
    ];
  }, [simData, params.splitRatioCurrent]);

  // Recharts Operational Metrics Data
  const opsChartData = useMemo(() => {
    if (!simData?.scenarios) return [];
    const { retain, split, switch: sw } = simData.scenarios;
    return [
      {
        name: 'Retain',
        leadTime: retain.blendedLeadTimeDays,
        riskScore: retain.blendedRiskScore,
        otdRate: retain.blendedOnTimeDeliveryRate,
      },
      {
        name: 'Dual-Source',
        leadTime: split.blendedLeadTimeDays,
        riskScore: split.blendedRiskScore,
        otdRate: split.blendedOnTimeDeliveryRate,
      },
      {
        name: 'Full Switch',
        leadTime: sw.blendedLeadTimeDays,
        riskScore: sw.blendedRiskScore,
        otdRate: sw.blendedOnTimeDeliveryRate,
      },
    ];
  }, [simData]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (isError || !simData) {
    return (
      <div className="p-12 text-center border border-rose-200 bg-rose-50/50 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
        <h3 className="font-bold text-base text-rose-800">Simulation Error</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">
          Could not calculate switching scenarios. Please verify supplier selections.
        </p>
        <button onClick={() => refetch()} className="btn-primary bg-rose-600 hover:bg-rose-700">
          Retry Calculation
        </button>
      </div>
    );
  }

  const { scenarios, currentSupplier, alternativeSupplier, tradeOffSummary } = simData;

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* ================================================================ */}
      {/* HEADER & QUICK PRESETS */}
      {/* ================================================================ */}
      <div className="bg-white border border-surface-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <Breadcrumbs
              items={[
                { label: 'Onchain Insights', href: '/onchain-insights' },
                { label: 'Supplier Switching Simulator' },
              ]}
            />
            <div className="flex items-center gap-3 mt-1">
              <h1 className="page-title text-2xl font-bold tracking-tight text-[#4B164C]">
                Supplier Switching & Dual-Sourcing Simulator
              </h1>
              <Badge className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200">
                Scenario Lab
              </Badge>
            </div>
            <p className="page-subtitle text-xs text-text-muted">
              Quantify financial deltas, lead-time shifts, delivery reliability gains, and disruption risk reduction across 3 operational strategies
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                toast.success('Simulation snapshot saved to procurement decision cache.');
              }}
              className="btn-secondary text-xs px-3.5 py-1.5 gap-1.5"
            >
              <FileText size={13} />
              Save Scenario
            </button>
            <button
              onClick={() => {
                toast.success('Transition proposal submitted to Human Approval Queue (Task 10).');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4B164C] text-white hover:bg-[#39103a] shadow-sm transition-all"
            >
              <Send size={13} />
              Submit Proposal
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
          <span className="text-[11px] font-bold text-text-muted flex items-center gap-1 mr-1">
            <Sparkles size={13} className="text-amber-500" />
            Quick Presets:
          </span>
          {DEFAULT_SWITCH_PAIRS.map((pair, idx) => (
            <button
              key={pair.materialName}
              onClick={() => applyPreset(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                params.materialName === pair.materialName
                  ? 'bg-[#4B164C] text-white border-[#4B164C] shadow-xs'
                  : 'bg-slate-50 text-text-secondary border-slate-200 hover:bg-slate-100 hover:text-text-primary'
              }`}
            >
              {pair.materialName}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* SIMULATOR ASSUMPTIONS PANEL */}
      {/* ================================================================ */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-[#4B164C]" />
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Simulation Assumptions & Inputs
            </h3>
          </div>
          <span className="text-[10px] text-text-muted font-medium">
            Adjust any variable to recalculate scenarios in real time
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Material Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">Material / SKU</label>
            <input
              type="text"
              value={params.materialName}
              onChange={(e) => setParams(p => ({ ...p, materialName: e.target.value }))}
              className="input-field py-1.5 h-9 text-xs w-full"
            />
          </div>

          {/* Current Supplier */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">Current Supplier</label>
            <select
              value={params.currentSupplierId}
              onChange={(e) => setParams(p => ({ ...p, currentSupplierId: e.target.value }))}
              className="input-field py-1.5 h-9 text-xs w-full font-medium"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.riskTier.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Alternative Supplier */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">Alternative Candidate</label>
            <select
              value={params.alternativeSupplierId}
              onChange={(e) => setParams(p => ({ ...p, alternativeSupplierId: e.target.value }))}
              className="input-field py-1.5 h-9 text-xs w-full font-medium"
            >
              {suppliers
                .filter(s => s.id !== params.currentSupplierId)
                .map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.riskTier.toUpperCase()})
                  </option>
                ))}
            </select>
          </div>

          {/* Annual Volume */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">Annual Volume (Units)</label>
            <input
              type="number"
              min="100"
              step="500"
              value={params.annualVolume}
              onChange={(e) => setParams(p => ({ ...p, annualVolume: Math.max(10, Number(e.target.value)) }))}
              className="input-field py-1.5 h-9 text-xs w-full"
            />
          </div>

          {/* Current Unit Cost */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">Current Unit Price (₹)</label>
            <input
              type="number"
              min="1"
              value={params.currentUnitCost}
              onChange={(e) => setParams(p => ({ ...p, currentUnitCost: Math.max(1, Number(e.target.value)) }))}
              className="input-field py-1.5 h-9 text-xs w-full"
            />
          </div>

          {/* Alternative Unit Cost */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">Alt Quoted Price (₹)</label>
            <input
              type="number"
              min="1"
              value={params.alternativeUnitCost}
              onChange={(e) => setParams(p => ({ ...p, alternativeUnitCost: Math.max(1, Number(e.target.value)) }))}
              className="input-field py-1.5 h-9 text-xs w-full"
            />
          </div>

          {/* Split Ratio Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <label className="font-bold text-text-muted uppercase">Dual-Source Split</label>
              <span className="font-bold text-[#4B164C]">
                {params.splitRatioCurrent}% / {100 - params.splitRatioCurrent}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={params.splitRatioCurrent}
              onChange={(e) => setParams(p => ({ ...p, splitRatioCurrent: Number(e.target.value) }))}
              className="w-full accent-[#4B164C] cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-text-muted">
              <span>More Primary</span>
              <span>More Backup</span>
            </div>
          </div>

          {/* One-time switching cost */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">One-Time Onboarding (₹)</label>
            <input
              type="number"
              min="0"
              step="5000"
              value={params.switchingCostOneTime}
              onChange={(e) => setParams(p => ({ ...p, switchingCostOneTime: Math.max(0, Number(e.target.value)) }))}
              className="input-field py-1.5 h-9 text-xs w-full"
            />
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* THREE-COLUMN SCENARIO COMPARISON CARDS */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SCENARIO A: RETAIN */}
        <ScenarioCard
          metric={scenarios.retain}
          isRecommended={tradeOffSummary.recommendedScenario === 'retain'}
          currency="₹"
        />

        {/* SCENARIO B: DUAL-SOURCE SPLIT */}
        <ScenarioCard
          metric={scenarios.split}
          isRecommended={tradeOffSummary.recommendedScenario === 'split'}
          currency="₹"
        />

        {/* SCENARIO C: FULL SWITCH */}
        <ScenarioCard
          metric={scenarios.switch}
          isRecommended={tradeOffSummary.recommendedScenario === 'switch'}
          currency="₹"
        />
      </div>

      {/* ================================================================ */}
      {/* VISUAL IMPACT CHARTS (COST + OPERATIONAL METRICS) */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Comparison Bar Chart */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Financial Impact Comparison
              </h3>
              <p className="text-base font-bold text-text-primary mt-0.5">
                First-Year Total Cost Breakdown (₹)
              </p>
            </div>
            <span className="text-[10px] font-bold text-text-muted bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              Landed Spend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costChartData} margin={{ top: 10, right: 10, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="scenario" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                <YAxis
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 10 }}
                  formatter={(value) => (value === 'materialCost' ? 'Material Spend' : 'One-Time Onboarding')}
                />
                <Bar dataKey="materialCost" stackId="a" fill="#4B164C" radius={[0, 0, 0, 0]} />
                <Bar dataKey="transitionCost" stackId="a" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Time & Risk Score Trade-Off */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Operational & Risk Trade-Offs
              </h3>
              <p className="text-base font-bold text-text-primary mt-0.5">
                Lead Time (Days) vs Risk Score (0–100)
              </p>
            </div>
            <span className="text-[10px] font-bold text-text-muted bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              Lower is Better
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={opsChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    name === 'leadTime' ? `${val} days` : `${val}/100`,
                    name === 'leadTime' ? 'Lead Time' : 'Risk Score',
                  ]}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 10 }}
                  formatter={(value) => (value === 'leadTime' ? 'Avg Lead Time (Days)' : 'Risk Score (0-100)')}
                />
                <Bar dataKey="leadTime" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="riskScore" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* RECOMMENDATION & TRADE-OFF SUMMARY */}
      {/* ================================================================ */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#4B164C]" />
            <h3 className="text-sm font-bold text-text-primary">
              Decision Analysis & Trade-Off Summary
            </h3>
          </div>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase text-[10px] font-bold">
            Recommendation: {tradeOffSummary.recommendedScenario.toUpperCase()}
          </Badge>
        </div>

        <div className="p-4 rounded-xl bg-[#F8E7F6]/30 border border-[#4B164C]/15 space-y-2 text-xs">
          <p className="font-bold text-[#4B164C]">Executive Rationale:</p>
          <p className="text-text-secondary leading-relaxed">{tradeOffSummary.rationale}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          {/* Key trade-offs */}
          <div className="space-y-2 p-4 bg-slate-50/70 rounded-xl border border-slate-100">
            <p className="font-bold text-text-primary flex items-center gap-1.5">
              <Scale size={13} className="text-blue-600" /> Key Trade-Offs Considered:
            </p>
            <ul className="space-y-1 text-text-secondary list-disc list-inside text-[11px]">
              {tradeOffSummary.keyTradeOffs.map((to, i) => (
                <li key={i}>{to}</li>
              ))}
            </ul>
          </div>

          {/* Mitigated disruptions */}
          <div className="space-y-2 p-4 bg-slate-50/70 rounded-xl border border-slate-100">
            <p className="font-bold text-text-primary flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-600" /> Disruption Risks Bypassed / Mitigated:
            </p>
            {tradeOffSummary.riskMitigatedDisruptions.length === 0 ? (
              <p className="text-[11px] text-text-muted">No active disruptions currently recorded for current supplier.</p>
            ) : (
              <ul className="space-y-1 text-text-secondary list-disc list-inside text-[11px]">
                {tradeOffSummary.riskMitigatedDisruptions.map((dis, i) => (
                  <li key={i}>{dis}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Data confidence transparency footnote */}
        <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-[10px] text-amber-800 flex items-start gap-2">
          <Info size={14} className="shrink-0 text-amber-600 mt-0.5" />
          <span>
            <strong>Data Confidence Disclaimer:</strong> Retain scenario costs and lead times are <em>Verified</em> against ERP purchase order records.
            Dual-source and Switch scenarios incorporate <em>Estimated</em> quote inputs and preliminary tooling estimates.
            Final commitments require executing quotation confirmation and quality audits.
          </span>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: SCENARIO CARD ---
function ScenarioCard({
  metric,
  isRecommended,
  currency,
}: {
  metric: ScenarioImpactMetrics;
  isRecommended: boolean;
  currency: string;
}) {
  const riskCfg = RISK_TIER_CONFIG[metric.riskTier];

  return (
    <div
      className={`glass-card p-5 space-y-4 relative flex flex-col justify-between transition-all ${
        isRecommended
          ? 'border-2 border-[#4B164C] shadow-md ring-4 ring-[#4B164C]/5'
          : 'border-surface-border'
      }`}
    >
      {/* Recommendation Banner */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4B164C] text-white text-[9px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
          <Sparkles size={10} /> Recommended Strategy
        </div>
      )}

      <div className="space-y-3">
        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              {metric.scenarioName === 'retain' ? 'Baseline' : metric.scenarioName === 'split' ? 'Balanced' : 'Aggressive'}
            </span>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                metric.confidenceLevel === 'verified'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : metric.confidenceLevel === 'partially_estimated'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {metric.confidenceLevel.replace('_', ' ')}
            </span>
          </div>
          <h4 className="font-bold text-sm text-text-primary leading-tight">
            {metric.scenarioTitle}
          </h4>
          <p className="text-[11px] text-text-secondary mt-1 leading-relaxed line-clamp-2">
            {metric.description}
          </p>
        </div>

        {/* Cost Block */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1 text-center">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">First-Year Total Cost</p>
          <p className="text-2xl font-black text-text-primary tracking-tight">
            {currency}{metric.totalFirstYearCost.toLocaleString()}
          </p>

          <div className="flex items-center justify-center gap-1 text-[11px] font-bold pt-0.5">
            {metric.costDeltaVsBaseline === 0 ? (
              <span className="text-text-muted font-semibold">Baseline Reference</span>
            ) : metric.costDeltaVsBaseline > 0 ? (
              <span className="text-rose-600 flex items-center gap-0.5">
                <TrendingUp size={12} /> +{currency}{metric.costDeltaVsBaseline.toLocaleString()} vs Baseline
              </span>
            ) : (
              <span className="text-emerald-600 flex items-center gap-0.5">
                <TrendingDown size={12} /> -{currency}{Math.abs(metric.costDeltaVsBaseline).toLocaleString()} Savings
              </span>
            )}
          </div>
        </div>

        {/* Key Operational Metrics */}
        <div className="space-y-2 text-xs pt-1">
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-text-muted text-[11px]">Blended Lead Time:</span>
            <span className="font-bold text-text-primary">
              {metric.blendedLeadTimeDays} days
              {metric.leadTimeDeltaDays !== 0 && (
                <span className={`text-[10px] ml-1 ${metric.leadTimeDeltaDays < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ({metric.leadTimeDeltaDays > 0 ? '+' : ''}{metric.leadTimeDeltaDays}d)
                </span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-text-muted text-[11px]">On-Time Delivery:</span>
            <span className="font-bold text-text-primary">{metric.blendedOnTimeDeliveryRate}%</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-text-muted text-[11px]">Disruption Risk:</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${riskCfg.bg} ${riskCfg.color} border ${riskCfg.border}`}
            >
              {metric.blendedRiskScore}/100 ({riskCfg.label})
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-text-muted text-[11px]">Dependency Mode:</span>
            <span className="font-semibold text-text-secondary text-[11px] truncate max-w-[150px]">
              {metric.dependencyConcentration}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-100 text-[10px] text-text-muted space-y-1">
        <p><strong>Timeline:</strong> {metric.feasibleInWeeks === 0 ? 'Immediate (Active)' : `${metric.feasibleInWeeks} weeks transition`}</p>
        <p className="truncate" title={metric.confidenceNotes}><strong>Source:</strong> {metric.confidenceNotes}</p>
      </div>
    </div>
  );
}
