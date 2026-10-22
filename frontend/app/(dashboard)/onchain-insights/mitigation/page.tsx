'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Info,
  Check,
  Plane,
  Truck,
  RotateCcw,
  Layers,
  ChevronRight,
  Send,
  Sliders,
  Building2,
  FileCheck2,
  Boxes,
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
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from 'recharts';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import {
  MITIGATION_STRATEGY_CONFIG,
  RISK_TIER_CONFIG,
  type MitigationOption,
  type MitigationDisruptionContext,
  type MitigationLabWeights,
  type MitigationStrategyType,
} from '@/types/onchain-insights';

export default function MitigationScenarioLabPage() {
  const { useMitigationLab, useSubmitMitigationApproval } = useOnchainInsights();

  // Selected disruption tab
  const [selectedDisruptionId, setSelectedDisruptionId] = useState<string>('DIS-2026-001');

  // Baseline algorithm weighting configuration
  const [weights, setWeights] = useState<MitigationLabWeights>({
    costEfficiency: 0.35,
    recoverySpeed: 0.35,
    feasibility: 0.20,
    operationalEase: 0.10,
  });

  // Local overrides for inline editable assumptions: map of [optionId_assumptionId] -> number
  const [assumptionOverrides, setAssumptionOverrides] = useState<Record<string, number>>({});

  // Active chart view toggle: 'bar_comparison' | 'tradeoff_scatter'
  const [chartView, setChartView] = useState<'bar_comparison' | 'tradeoff_scatter'>('bar_comparison');

  // Comparison drawer/modal state
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Approval submission modal state
  const [approvalModalOption, setApprovalModalOption] = useState<MitigationOption | null>(null);
  const [approvalComments, setApprovalComments] = useState<string>('');
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState<boolean>(false);

  // Query API
  const { data: labResponse, isLoading, isError, refetch } = useMitigationLab(selectedDisruptionId, weights);
  const submitApprovalMutation = useSubmitMitigationApproval();

  const disruptions = labResponse?.data?.disruptions || [];
  const currentDisruption = useMemo(() => {
    return disruptions.find((d) => d.id === selectedDisruptionId) || disruptions[0];
  }, [disruptions, selectedDisruptionId]);

  // Compute dynamically adjusted options taking assumption overrides into account
  const optionsWithAdjustedAssumptions: MitigationOption[] = useMemo(() => {
    if (!currentDisruption) return [];

    return currentDisruption.options.map((opt) => {
      // Check if any assumptions for this option were tweaked
      let costAdjustmentMultiplier = 1;
      let timeAdjustmentDelta = 0;

      opt.assumptions.forEach((assump) => {
        const key = `${opt.id}_${assump.id}`;
        if (assumptionOverrides[key] !== undefined) {
          const newVal = assumptionOverrides[key];
          const defaultVal = assump.value;
          if (defaultVal > 0) {
            // Adjust costs/times dynamically based on assumption ratio
            if (assump.unit.includes('₹') || assump.unit.includes('%')) {
              costAdjustmentMultiplier *= newVal / defaultVal;
            } else if (assump.unit.includes('days') || assump.unit.includes('hours')) {
              timeAdjustmentDelta += (newVal - defaultVal) / (assump.unit.includes('hours') ? 24 : 1);
            }
          }
        }
      });

      const adjustedCost = Math.round(opt.estimatedCostINR * costAdjustmentMultiplier);
      const adjustedDays = Math.max(1, Math.round(opt.recoveryTimeDays + timeAdjustmentDelta));

      // Recalculate score with modified values
      const costRatio = currentDisruption.totalRevenueAtRiskINR > 0
        ? (adjustedCost / currentDisruption.totalRevenueAtRiskINR) * 100
        : 10;
      const costEff = Math.min(100, Math.max(10, Math.round(100 - costRatio * 2.5)));

      const daysSaved = Math.max(0, currentDisruption.currentDelayDays - adjustedDays);
      const speedRatio = currentDisruption.currentDelayDays > 0
        ? (daysSaved / currentDisruption.currentDelayDays) * 100
        : 50;
      const speedEff = Math.min(100, Math.max(15, Math.round(speedRatio)));

      const feas = opt.feasibilityPercent;
      let ease = opt.residualRisk === 'low' ? 90 : opt.residualRisk === 'medium' ? 75 : 60;
      ease = Math.max(40, ease - opt.executionSteps.length * 2);

      const dynamicScore = Math.round(
        costEff * weights.costEfficiency +
        speedEff * weights.recoverySpeed +
        feas * weights.feasibility +
        ease * weights.operationalEase
      );

      return {
        ...opt,
        estimatedCostINR: adjustedCost,
        recoveryTimeDays: adjustedDays,
        score: dynamicScore,
        scoringRationale: {
          costEfficiencyScore: costEff,
          recoverySpeedScore: speedEff,
          feasibilityScore: feas,
          operationalEaseScore: ease,
          explanation: `Score recalculated dynamically: Cost Efficiency (${costEff}/100), Recovery Speed (${speedEff}/100), Feasibility (${feas}/100), Ease (${ease}/100).`,
        },
      };
    }).sort((a, b) => b.score - a.score).map((opt, idx) => ({
      ...opt,
      rank: idx + 1,
      isRecommended: idx === 0,
    }));
  }, [currentDisruption, assumptionOverrides, weights]);

  // Best recommended option
  const recommendedOption = optionsWithAdjustedAssumptions[0];

  // Update assumption
  const handleAssumptionChange = (optionId: string, assumptionId: string, value: number) => {
    setAssumptionOverrides((prev) => ({
      ...prev,
      [`${optionId}_${assumptionId}`]: value,
    }));
  };

  // Reset assumptions for current disruption
  const handleResetAssumptions = () => {
    setAssumptionOverrides({});
    toast.success('Reset all inline assumption overrides to defaults.');
  };

  // Toggle selection for comparison
  const toggleComparison = (id: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        toast.error('You can compare a maximum of 3 options side-by-side.');
        return prev;
      }
      return [...prev, id];
    });
  };

  // Submit for approval handler
  const handleConfirmApprovalSubmission = async () => {
    if (!approvalModalOption || !currentDisruption) return;

    try {
      const res = await submitApprovalMutation.mutateAsync({
        optionId: approvalModalOption.id,
        disruptionId: currentDisruption.id,
        comments: approvalComments,
      });

      toast.success(res.message || 'Mitigation plan logged for executive review.');
      setApprovalModalOption(null);
      setApprovalComments('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit mitigation option.');
    }
  };

  // Chart data preparation
  const chartData = useMemo(() => {
    return optionsWithAdjustedAssumptions.map((opt) => ({
      name: opt.title.split(' ')[0] + ' ' + opt.title.split(' ')[1],
      fullName: opt.title,
      strategy: MITIGATION_STRATEGY_CONFIG[opt.strategyType]?.label || opt.strategyType,
      costINR: opt.estimatedCostINR,
      recoveryDays: opt.recoveryTimeDays,
      revenueProtectedINR: opt.netRevenueProtectedINR,
      ordersProtected: opt.ordersProtectedCount,
      feasibility: opt.feasibilityPercent,
      score: opt.score,
      isRecommended: opt.isRecommended,
    }));
  }, [optionsWithAdjustedAssumptions]);

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

  if (isError || !currentDisruption) {
    return (
      <div className="p-12 text-center border border-rose-200 bg-rose-50/50 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
        <h3 className="font-bold text-base text-rose-800">Mitigation Lab Error</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">
          Could not load recovery options or scenario simulations.
        </p>
        <button onClick={() => refetch()} className="btn-primary bg-rose-600 hover:bg-rose-700">
          Retry Scenario Lab
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* ================================================================ */}
      {/* HEADER & DISRUPTION CONTEXT BAR */}
      {/* ================================================================ */}
      <div className="bg-white border border-surface-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <Breadcrumbs
              items={[
                { label: 'Onchain Insights', href: '/onchain-insights' },
                { label: 'Mitigation Scenario Lab' },
              ]}
            />
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h1 className="page-title text-2xl font-bold tracking-tight text-[#4B164C]">
                Mitigation Recommendation & Scenario Lab
              </h1>
              <Badge className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 bg-[#F8E7F6] text-[#4B164C] border border-[#e5cbe3] flex items-center gap-1">
                <SlidersHorizontal size={11} className="text-[#4B164C]" />
                Baseline Decision Engine
              </Badge>
            </div>
            <p className="page-subtitle text-xs text-text-muted">
              Simulate recovery actions (alternate sourcing, expedited air/road freight, buffer stock drawdowns) with transparent mathematical trade-offs
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsWeightsModalOpen(true)}
              className="btn-secondary text-xs px-3.5 py-1.5 gap-1.5"
            >
              <Sliders size={13} />
              Algorithm Weights
            </button>
            <button
              onClick={handleResetAssumptions}
              className="btn-secondary text-xs px-3.5 py-1.5 gap-1.5"
            >
              <RotateCcw size={13} />
              Reset Overrides
            </button>
            {selectedForComparison.length >= 2 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4B164C] text-white hover:bg-[#39103a] shadow-sm transition-all"
              >
                <Layers size={13} />
                Compare ({selectedForComparison.length}) Options
              </button>
            )}
          </div>
        </div>

        {/* Disruption Selector Tabs */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider shrink-0 mr-1">
            Select Active Disruption:
          </span>
          {disruptions.map((d) => {
            const isSelected = d.id === selectedDisruptionId;
            return (
              <button
                key={d.id}
                onClick={() => {
                  setSelectedDisruptionId(d.id);
                  setSelectedForComparison([]);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#4B164C] text-white border-[#4B164C] shadow-xs'
                    : 'bg-slate-50 text-text-secondary border-slate-200 hover:bg-slate-100'
                }`}
              >
                <AlertTriangle size={12} className={isSelected ? 'text-amber-300' : 'text-amber-500'} />
                <span className="truncate max-w-[200px]">{d.title}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {d.currentDelayDays}d delay
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* INCIDENT CONTEXT BANNER */}
      {/* ================================================================ */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              {currentDisruption.id}
            </span>
            <span className="font-bold text-amber-900 text-sm">{currentDisruption.title}</span>
            <Badge className="uppercase text-[9px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 border-rose-200">
              {currentDisruption.severity} severity
            </Badge>
          </div>
          <p className="text-amber-800 text-xs">
            Incumbent Vendor: <strong className="font-semibold text-text-primary">{currentDisruption.affectedSupplier}</strong> • 
            Material: <strong className="font-semibold text-text-primary">{currentDisruption.affectedMaterial}</strong> ({currentDisruption.sku})
          </p>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-amber-700">Baseline Exposure</p>
            <p className="text-base font-black text-rose-700 font-mono">
              ₹{currentDisruption.totalRevenueAtRiskINR.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="h-8 w-px bg-amber-200" />
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-amber-700">Orders at Risk</p>
            <p className="text-base font-black text-amber-900 font-mono">
              {currentDisruption.totalOrdersAtRisk} Orders
            </p>
          </div>
          <div className="h-8 w-px bg-amber-200" />
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-amber-700">Unmitigated Delay</p>
            <p className="text-base font-black text-rose-700 font-mono">
              +{currentDisruption.currentDelayDays} Days
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* TOP SUMMARY KPIS (BEST RECOVERY PATH) */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="glass-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-text-muted uppercase">Recommended Strategy</p>
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-bold text-[#4B164C] line-clamp-1">
              {recommendedOption?.title.split(' ')[0]} {recommendedOption?.title.split(' ')[1]}
            </p>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Rank #1
            </span>
          </div>
          <p className="text-[11px] text-text-muted flex items-center gap-1">
            <Sparkles size={11} className="text-amber-500" />
            Baseline Score: <strong className="text-text-primary font-mono">{recommendedOption?.score}/100</strong>
          </p>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-text-muted uppercase">Recovery Time Saved</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-emerald-600 font-mono">
              {Math.max(0, currentDisruption.currentDelayDays - (recommendedOption?.recoveryTimeDays || 0))} Days
            </p>
            <span className="text-xs text-text-muted">
              (from {currentDisruption.currentDelayDays}d down to {recommendedOption?.recoveryTimeDays}d)
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            Recovery in {recommendedOption?.recoveryTimeDays} days vs {currentDisruption.currentDelayDays}d unmitigated
          </p>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-text-muted uppercase">Net Revenue Protected</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-[#4B164C] font-mono">
              ₹{recommendedOption?.netRevenueProtectedINR.toLocaleString('en-IN')}
            </p>
          </div>
          <p className="text-[11px] text-text-muted">
            Cost: ₹{recommendedOption?.estimatedCostINR.toLocaleString('en-IN')} ({((recommendedOption?.estimatedCostINR / currentDisruption.totalRevenueAtRiskINR) * 100).toFixed(1)}% ratio)
          </p>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-text-muted uppercase">Customer Orders Protected</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-text-primary font-mono">
              {recommendedOption?.ordersProtectedCount} / {currentDisruption.totalOrdersAtRisk}
            </p>
            <span className="text-xs font-bold text-emerald-600">
              ({(((recommendedOption?.ordersProtectedCount || 0) / currentDisruption.totalOrdersAtRisk) * 100).toFixed(0)}%)
            </span>
          </div>
          <p className="text-[11px] text-text-muted">
            Residual Risk: <span className="font-bold uppercase text-emerald-700">{recommendedOption?.residualRisk}</span>
          </p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* TRADE-OFF CHART (COST VS RECOVERY TIME) */}
      {/* ================================================================ */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <TrendingUp size={15} className="text-[#4B164C]" />
              Recovery Scenario Trade-Off Visualizer
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Evaluating financial commitment vs days to resumption across available mitigation levers
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setChartView('bar_comparison')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                chartView === 'bar_comparison'
                  ? 'bg-white text-[#4B164C] shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Cost & Recovery Bar Chart
            </button>
            <button
              onClick={() => setChartView('tradeoff_scatter')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                chartView === 'tradeoff_scatter'
                  ? 'bg-white text-[#4B164C] shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Cost vs Time Frontier
            </button>
          </div>
        </div>

        {/* Chart Render */}
        <div className="h-64 w-full">
          {chartView === 'bar_comparison' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `${val}d`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => {
                    if (name === 'Estimated Cost') return [`₹${Number(val).toLocaleString('en-IN')}`, name];
                    if (name === 'Recovery Days') return [`${val} Days`, name];
                    return [val, name];
                  }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="costINR"
                  name="Estimated Cost"
                  fill="#4B164C"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
                <Bar
                  yAxisId="right"
                  dataKey="recoveryDays"
                  name="Recovery Days"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  dataKey="recoveryDays"
                  name="Recovery Days"
                  unit=" days"
                  tick={{ fontSize: 11 }}
                  domain={[0, 'dataMax + 2']}
                />
                <YAxis
                  type="number"
                  dataKey="costINR"
                  name="Incremental Cost"
                  unit=" ₹"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <ZAxis type="number" dataKey="score" range={[60, 240]} name="Baseline Score" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1">
                        <p className="font-bold text-[#4B164C]">{d.fullName}</p>
                        <p className="text-text-muted">Strategy: <span className="font-semibold text-text-primary">{d.strategy}</span></p>
                        <p className="text-text-muted">Recovery: <strong className="text-text-primary">{d.recoveryDays} Days</strong></p>
                        <p className="text-text-muted">Cost: <strong className="text-emerald-700 font-mono">₹{d.costINR.toLocaleString('en-IN')}</strong></p>
                        <p className="text-text-muted">Protected Revenue: <strong className="text-[#4B164C] font-mono">₹{d.revenueProtectedINR.toLocaleString('en-IN')}</strong></p>
                        <p className="text-text-muted">Baseline Score: <strong className="text-purple-700 font-mono">{d.score}/100</strong></p>
                      </div>
                    );
                  }}
                />
                <Scatter name="Scenarios" data={chartData}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isRecommended ? '#10b981' : '#4B164C'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* RANKED RECOVERY OPTION CARDS */}
      {/* ================================================================ */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Boxes size={18} className="text-[#4B164C]" />
              Ranked Mitigation Options ({optionsWithAdjustedAssumptions.length} Available)
            </h3>
            <p className="text-xs text-text-muted">
              Ranked dynamically via deterministic baseline scoring based on cost, speed, feasibility, and operational disruption
            </p>
          </div>
          <span className="text-[11px] text-text-muted italic">
            Select checkboxes to compare up to 3 options side-by-side
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {optionsWithAdjustedAssumptions.map((option) => {
            const stratCfg = MITIGATION_STRATEGY_CONFIG[option.strategyType] || MITIGATION_STRATEGY_CONFIG.alternate_supplier;
            const riskCfg = RISK_TIER_CONFIG[option.residualRisk] || RISK_TIER_CONFIG.low;
            const isCompared = selectedForComparison.includes(option.id);

            return (
              <div
                key={option.id}
                className={`glass-card p-6 rounded-2xl space-y-4 border-2 transition-all relative ${
                  option.isRecommended
                    ? 'border-[#4B164C] shadow-md ring-4 ring-[#4B164C]/10 bg-white'
                    : isCompared
                    ? 'border-indigo-400 bg-white shadow-sm'
                    : 'border-surface-border bg-white hover:border-slate-300'
                }`}
              >
                {/* Header: Rank, Title, Strategy Badge, Checkbox */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                          option.isRecommended
                            ? 'bg-[#4B164C] text-white shadow-xs'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Rank #{option.rank}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${stratCfg.bg} ${stratCfg.color} border ${stratCfg.border}`}>
                        {stratCfg.label}
                      </span>
                      {option.isRecommended && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          Recommended Baseline
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-text-primary leading-tight">
                      {option.title}
                    </h4>
                  </div>

                  {/* Compare Checkbox */}
                  <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer shrink-0 select-none">
                    <input
                      type="checkbox"
                      checked={isCompared}
                      onChange={() => toggleComparison(option.id)}
                      className="rounded border-slate-300 text-[#4B164C] focus:ring-[#4B164C] h-4 w-4"
                    />
                    <span className="text-[11px] font-semibold">Compare</span>
                  </label>
                </div>

                {/* Summary narrative */}
                <p className="text-xs text-text-secondary leading-relaxed">
                  {option.summary}
                </p>

                {/* Metrics 4-Col Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-text-muted uppercase">Estimated Cost</p>
                    <p className="text-sm font-black text-[#4B164C] font-mono">
                      ₹{option.estimatedCostINR.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-text-muted uppercase">Recovery Time</p>
                    <p className="text-sm font-black text-amber-700 font-mono">
                      {option.recoveryTimeDays} Days
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-text-muted uppercase">Feasibility</p>
                    <p className="text-sm font-black text-emerald-700 font-mono">
                      {option.feasibilityPercent}%
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-text-muted uppercase">Residual Risk</p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${riskCfg.bg} ${riskCfg.color}`}>
                      {riskCfg.label}
                    </span>
                  </div>
                </div>

                {/* Orders & Revenue Protected */}
                <div className="flex items-center justify-between text-xs py-1 border-t border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted">Protected Orders:</span>
                    <strong className="text-text-primary font-mono">{option.ordersProtectedCount} of {currentDisruption.totalOrdersAtRisk}</strong>
                    {option.ordersAtRiskRemaining > 0 && (
                      <span className="text-[10px] text-rose-600 font-bold">({option.ordersAtRiskRemaining} deferred)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted">Protected Revenue:</span>
                    <strong className="text-emerald-700 font-mono">₹{option.netRevenueProtectedINR.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {/* Source & Route */}
                <div className="text-xs space-y-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-text-muted">Supply Vector:</span>
                    <span className="font-semibold text-text-primary">{option.sourceEntity}</span>
                  </div>
                  {option.logisticsCarrierOrRoute && (
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-text-muted">Route / Carrier:</span>
                      <span className="font-semibold text-text-primary truncate max-w-[260px]">{option.logisticsCarrierOrRoute}</span>
                    </div>
                  )}
                </div>

                {/* Execution Steps */}
                <div className="space-y-1.5 text-xs">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    Execution Milestones:
                  </p>
                  <ul className="space-y-1">
                    {option.executionSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px] text-text-secondary">
                        <Check size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Inline Adjustable Assumptions Accordion / Panel */}
                {option.assumptions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-text-muted uppercase flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <SlidersHorizontal size={11} className="text-[#4B164C]" />
                        Interactive Assumptions & Levers:
                      </span>
                      <span className="text-[9px] text-text-muted lowercase">adjust to simulate impact</span>
                    </p>
                    <div className="space-y-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200">
                      {option.assumptions.map((assump) => {
                        const currentVal = assumptionOverrides[`${option.id}_${assump.id}`] ?? assump.value;
                        return (
                          <div key={assump.id} className="space-y-1 text-xs">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-text-secondary">{assump.name}:</span>
                              <span className="font-bold text-[#4B164C] font-mono">
                                {currentVal.toLocaleString('en-IN')} {assump.unit}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min={assump.min}
                                max={assump.max}
                                step={assump.step}
                                value={currentVal}
                                onChange={(e) =>
                                  handleAssumptionChange(option.id, assump.id, parseFloat(e.target.value))
                                }
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4B164C]"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Explainable Scoring Rationale Footnote */}
                <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 text-[10px] text-purple-900 space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1">
                      <Info size={11} className="text-[#4B164C]" /> Baseline Scoring Breakdown:
                    </span>
                    <span className="font-mono text-purple-800 font-bold">{option.score}/100 Score</span>
                  </div>
                  <p className="text-[10px] text-purple-800 leading-normal">
                    {option.scoringRationale.explanation}
                  </p>
                </div>

                {/* Action Controls */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setSelectedForComparison([option.id]);
                      setIsCompareModalOpen(true);
                    }}
                    className="btn-secondary text-xs px-3 py-1.5 flex-1"
                  >
                    Inspect Full Details
                  </button>

                  <button
                    onClick={() => {
                      setApprovalModalOption(option);
                      setApprovalComments(`Recommended recovery action for ${currentDisruption.title}. Estimated budget: ₹${option.estimatedCostINR.toLocaleString('en-IN')}.`);
                    }}
                    className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#4B164C] text-white hover:bg-[#39103a] shadow-xs transition-all flex-1"
                  >
                    <Send size={12} />
                    Submit for Approval
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* METHODOLOGY & GOVERNANCE NOTICE */}
      {/* ================================================================ */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-text-muted space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-text-primary">
          <Info size={13} className="text-[#4B164C]" /> Governance & Transparency Policy:
        </div>
        <p className="leading-relaxed">
          {labResponse?.data?.methodologyNote ||
            'Recommendations are produced via deterministic baseline multi-criteria decision analysis (MCDA) combining Cost Efficiency (35%), Recovery Speed (35%), Feasibility (20%), and Operational Disruption (10%). They are intentionally labeled as "Baseline Algorithm" rather than globally optimal. Operational leads must review vendor capacity and customs clearance feasibility before finalizing purchase commitments.'}
        </p>
      </div>

      {/* ================================================================ */}
      {/* MODAL 1: SIDE-BY-SIDE COMPARISON MODAL */}
      {/* ================================================================ */}
      <Modal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        title="Side-by-Side Mitigation Scenario Comparison"
        size="2xl"
      >
        <div className="space-y-5">
          <p className="text-xs text-text-muted">
            Direct comparative analysis of candidate recovery strategies for <strong>{currentDisruption.title}</strong>
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-3 text-[10px] font-bold uppercase text-text-muted">Criteria</th>
                  {(selectedForComparison.length > 0
                    ? optionsWithAdjustedAssumptions.filter((o) => selectedForComparison.includes(o.id))
                    : optionsWithAdjustedAssumptions.slice(0, 3)
                  ).map((opt) => (
                    <th key={opt.id} className="p-3 text-xs font-bold text-text-primary max-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800">
                          #{opt.rank}
                        </span>
                        <span className="truncate">{opt.title}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-semibold text-text-muted">Strategy Type</td>
                  {(selectedForComparison.length > 0
                    ? optionsWithAdjustedAssumptions.filter((o) => selectedForComparison.includes(o.id))
                    : optionsWithAdjustedAssumptions.slice(0, 3)
                  ).map((opt) => (
                    <td key={opt.id} className="p-3 font-semibold text-text-primary">
                      {MITIGATION_STRATEGY_CONFIG[opt.strategyType]?.label}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-text-muted">Estimated Cost (INR)</td>
                  {(selectedForComparison.length > 0
                    ? optionsWithAdjustedAssumptions.filter((o) => selectedForComparison.includes(o.id))
                    : optionsWithAdjustedAssumptions.slice(0, 3)
                  ).map((opt) => (
                    <td key={opt.id} className="p-3 font-mono font-bold text-[#4B164C]">
                      ₹{opt.estimatedCostINR.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-text-muted">Recovery Duration</td>
                  {(selectedForComparison.length > 0
                    ? optionsWithAdjustedAssumptions.filter((o) => selectedForComparison.includes(o.id))
                    : optionsWithAdjustedAssumptions.slice(0, 3)
                  ).map((opt) => (
                    <td key={opt.id} className="p-3 font-mono font-bold text-amber-700">
                      {opt.recoveryTimeDays} Days (Saves {Math.max(0, currentDisruption.currentDelayDays - opt.recoveryTimeDays)}d)
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-text-muted">Protected Orders</td>
                  {(selectedForComparison.length > 0
                    ? optionsWithAdjustedAssumptions.filter((o) => selectedForComparison.includes(o.id))
                    : optionsWithAdjustedAssumptions.slice(0, 3)
                  ).map((opt) => (
                    <td key={opt.id} className="p-3 font-mono font-semibold text-text-primary">
                      {opt.ordersProtectedCount} of {currentDisruption.totalOrdersAtRisk}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-text-muted">Protected Revenue</td>
                  {(selectedForComparison.length > 0
                    ? optionsWithAdjustedAssumptions.filter((o) => selectedForComparison.includes(o.id))
                    : optionsWithAdjustedAssumptions.slice(0, 3)
                  ).map((opt) => (
                    <td key={opt.id} className="p-3 font-mono font-bold text-emerald-700">
                      ₹{opt.netRevenueProtectedINR.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-text-muted">Feasibility</td>
                  {(selectedForComparison.length > 0
                    ? optionsWithAdjustedAssumptions.filter((o) => selectedForComparison.includes(o.id))
                    : optionsWithAdjustedAssumptions.slice(0, 3)
                  ).map((opt) => (
                    <td key={opt.id} className="p-3 font-bold text-emerald-700">
                      {opt.feasibilityPercent}%
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-text-muted">Residual Risk</td>
                  {(selectedForComparison.length > 0
                    ? optionsWithAdjustedAssumptions.filter((o) => selectedForComparison.includes(o.id))
                    : optionsWithAdjustedAssumptions.slice(0, 3)
                  ).map((opt) => (
                    <td key={opt.id} className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${RISK_TIER_CONFIG[opt.residualRisk]?.bg} ${RISK_TIER_CONFIG[opt.residualRisk]?.color}`}>
                        {opt.residualRisk}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-text-muted">Baseline Algorithm Score</td>
                  {(selectedForComparison.length > 0
                    ? optionsWithAdjustedAssumptions.filter((o) => selectedForComparison.includes(o.id))
                    : optionsWithAdjustedAssumptions.slice(0, 3)
                  ).map((opt) => (
                    <td key={opt.id} className="p-3 font-bold font-mono text-purple-700">
                      {opt.score}/100 {opt.isRecommended ? '★ Top' : ''}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="btn-primary"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </Modal>

      {/* ================================================================ */}
      {/* MODAL 2: ALGORITHM WEIGHT SENSITIVITY MODAL */}
      {/* ================================================================ */}
      <Modal
        isOpen={isWeightsModalOpen}
        onClose={() => setIsWeightsModalOpen(false)}
        title="Deterministic Algorithm Weighting Calibration"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted leading-relaxed">
            Adjust the priority weights used to rank recovery scenarios. The total sum should equal 100%.
          </p>

          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-text-primary">Cost Efficiency Weight:</span>
                <span className="font-bold text-[#4B164C] font-mono">{Math.round(weights.costEfficiency * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.05"
                value={weights.costEfficiency}
                onChange={(e) => setWeights({ ...weights, costEfficiency: parseFloat(e.target.value) })}
                className="w-full h-1.5 accent-[#4B164C]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-text-primary">Recovery Speed Weight:</span>
                <span className="font-bold text-amber-700 font-mono">{Math.round(weights.recoverySpeed * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.05"
                value={weights.recoverySpeed}
                onChange={(e) => setWeights({ ...weights, recoverySpeed: parseFloat(e.target.value) })}
                className="w-full h-1.5 accent-amber-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-text-primary">Feasibility Weight:</span>
                <span className="font-bold text-emerald-700 font-mono">{Math.round(weights.feasibility * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.4"
                step="0.05"
                value={weights.feasibility}
                onChange={(e) => setWeights({ ...weights, feasibility: parseFloat(e.target.value) })}
                className="w-full h-1.5 accent-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-text-primary">Operational Ease Weight:</span>
                <span className="font-bold text-blue-700 font-mono">{Math.round(weights.operationalEase * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.3"
                step="0.05"
                value={weights.operationalEase}
                onChange={(e) => setWeights({ ...weights, operationalEase: parseFloat(e.target.value) })}
                className="w-full h-1.5 accent-blue-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                setWeights({
                  costEfficiency: 0.35,
                  recoverySpeed: 0.35,
                  feasibility: 0.20,
                  operationalEase: 0.10,
                });
                toast.success('Restored default algorithm weights (35/35/20/10).');
              }}
              className="btn-secondary text-xs"
            >
              Reset to Defaults
            </button>
            <button
              onClick={() => setIsWeightsModalOpen(false)}
              className="btn-primary text-xs"
            >
              Apply Weights
            </button>
          </div>
        </div>
      </Modal>

      {/* ================================================================ */}
      {/* MODAL 3: SUBMIT FOR EXECUTIVE APPROVAL MODAL */}
      {/* ================================================================ */}
      <Modal
        isOpen={Boolean(approvalModalOption)}
        onClose={() => setApprovalModalOption(null)}
        title="Submit Mitigation Scenario for Executive Approval"
        size="md"
      >
        {approvalModalOption && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1">
              <p className="text-[10px] font-bold text-purple-700 uppercase">Selected Strategy</p>
              <h4 className="font-bold text-text-primary text-sm">{approvalModalOption.title}</h4>
              <p className="text-text-muted text-[11px]">{approvalModalOption.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-[10px] text-text-muted font-bold uppercase">Estimated Budget</p>
                <p className="text-base font-black text-[#4B164C] font-mono">
                  ₹{approvalModalOption.estimatedCostINR.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-[10px] text-text-muted font-bold uppercase">Resolution Time</p>
                <p className="text-base font-black text-amber-700 font-mono">
                  {approvalModalOption.recoveryTimeDays} Days
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text-primary">Executive Justification & Comments:</label>
              <textarea
                rows={3}
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="Specify justification or conditions for leadership sign-off..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#4B164C]/20 focus:border-[#4B164C] outline-hidden"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
              <ShieldAlert size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                Submission routes this plan to the <strong>Decision & Approval Center</strong> for two-party authorization before any ERP purchase amendments are generated.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setApprovalModalOption(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprovalSubmission}
                disabled={submitApprovalMutation.isPending}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <Send size={12} />
                {submitApprovalMutation.isPending ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
