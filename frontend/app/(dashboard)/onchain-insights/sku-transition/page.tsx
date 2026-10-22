'use client';

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Calendar,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Warehouse,
  Sliders,
  Send,
  FileText,
  Sparkles,
  RefreshCw,
  Info,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  Clock,
  MapPin,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import { PRECONFIGURED_SKU_PAIRS } from '@/lib/mock-data/onchain-insights/sku-transition';
import type {
  SkuTransitionParams,
  SkuTransitionStrategy,
  SkuInventoryLocation,
} from '@/types/onchain-insights';

export default function SkuTransitionPage() {
  const { useSkuTransition } = useOnchainInsights();

  // Selected Preset Index
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const currentPreset = PRECONFIGURED_SKU_PAIRS[selectedPresetIndex];

  // Strategy Selection Tab (aggressive | balanced | conservative)
  const [activeStrategyKey, setActiveStrategyKey] = useState<'aggressive' | 'balanced' | 'conservative'>('balanced');

  // Accordion state for deep-dive weekly table
  const [showWeeklySchedule, setShowWeeklySchedule] = useState<boolean>(true);

  // Editable Simulation Parameters
  const [params, setParams] = useState<SkuTransitionParams>({
    oldSku: currentPreset.oldSku,
    newSku: currentPreset.newSku,
    productName: currentPreset.productName,
    currentOldInventory: currentPreset.currentOldInventory,
    weeklyDemandRate: currentPreset.weeklyDemandRate,
    newSkuLeadTimeWeeks: currentPreset.newSkuLeadTimeWeeks,
    unitCostOld: currentPreset.unitCostOld,
    unitCostNew: currentPreset.unitCostNew,
    holdingCostPerUnitYear: currentPreset.holdingCostPerUnitYear,
    salvageScrapValuePercent: currentPreset.salvageScrapValuePercent,
  });

  // Query transition result
  const { data: transitionResponse, isLoading, isError, refetch } = useSkuTransition(params);
  const transitionData = transitionResponse?.data;

  // Apply a preconfigured pair preset
  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const p = PRECONFIGURED_SKU_PAIRS[index];
    setParams({
      oldSku: p.oldSku,
      newSku: p.newSku,
      productName: p.productName,
      currentOldInventory: p.currentOldInventory,
      weeklyDemandRate: p.weeklyDemandRate,
      newSkuLeadTimeWeeks: p.newSkuLeadTimeWeeks,
      unitCostOld: p.unitCostOld,
      unitCostNew: p.unitCostNew,
      holdingCostPerUnitYear: p.holdingCostPerUnitYear,
      salvageScrapValuePercent: p.salvageScrapValuePercent,
    });
    toast.success(`Loaded catalog pair: ${p.productName}`);
  };

  // Reset to preset defaults
  const handleResetParams = () => {
    const p = PRECONFIGURED_SKU_PAIRS[selectedPresetIndex];
    setParams({
      oldSku: p.oldSku,
      newSku: p.newSku,
      productName: p.productName,
      currentOldInventory: p.currentOldInventory,
      weeklyDemandRate: p.weeklyDemandRate,
      newSkuLeadTimeWeeks: p.newSkuLeadTimeWeeks,
      unitCostOld: p.unitCostOld,
      unitCostNew: p.unitCostNew,
      holdingCostPerUnitYear: p.holdingCostPerUnitYear,
      salvageScrapValuePercent: p.salvageScrapValuePercent,
    });
    toast.success('Reset inputs to ERP baseline standards.');
  };

  // Active Strategy Details
  const activeStrategy: SkuTransitionStrategy | undefined = useMemo(() => {
    if (!transitionData?.strategies) return undefined;
    return transitionData.strategies[activeStrategyKey];
  }, [transitionData, activeStrategyKey]);

  // Chart timeline data for active strategy
  const chartData = useMemo(() => {
    if (!activeStrategy) return [];
    return activeStrategy.timeline.map((point) => ({
      week: `Wk ${point.week}`,
      fullDate: point.date,
      weekNum: point.week,
      oldSkuInventory: point.oldSkuInventory,
      newSkuInventory: point.newSkuInventory,
      marketDemand: point.totalMarketDemand,
      oldSkuFulfillment: point.oldSkuFulfillment,
      newSkuFulfillment: point.newSkuFulfillment,
      unmetDemand: point.unmetDemand,
    }));
  }, [activeStrategy]);

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

  if (isError || !transitionData) {
    return (
      <div className="p-12 text-center border border-rose-200 bg-rose-50/50 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
        <h3 className="font-bold text-base text-rose-800">Projection Calculation Error</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">
          Could not compute SKU transition models. Verify stock parameters and demand rate.
        </p>
        <button onClick={() => refetch()} className="btn-primary bg-rose-600 hover:bg-rose-700">
          Retry Projection
        </button>
      </div>
    );
  }

  const { oldSkuDetails, newSkuDetails, strategies } = transitionData;
  const crossoverWeek = activeStrategy?.projectedCrossoverWeek || 6;

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
                { label: 'SKU Transition Planning' },
              ]}
            />
            <div className="flex items-center gap-3 mt-1">
              <h1 className="page-title text-2xl font-bold tracking-tight text-[#4B164C]">
                SKU Transition & Depletion Planning Assistant
              </h1>
              <Badge className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200">
                Phase-In / Phase-Out
              </Badge>
            </div>
            <p className="page-subtitle text-xs text-text-muted">
              Project old-SKU inventory rundown, superseding SKU ramp-up crossover, multi-facility balances, and scrap vs stockout risk trade-offs
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                toast.success('Transition schedule exported to ERP procurement plan (CSV/PDF).');
              }}
              className="btn-secondary text-xs px-3.5 py-1.5 gap-1.5"
            >
              <FileText size={13} />
              Export Transition Plan
            </button>
            <button
              onClick={() => {
                toast.success('Transition purchase order authorization submitted to Approval Queue (Task 10).');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4B164C] text-white hover:bg-[#39103a] shadow-sm transition-all"
            >
              <Send size={13} />
              Submit Transition Order
            </button>
          </div>
        </div>

        {/* Catalog Preset Switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
          <span className="text-[11px] font-bold text-text-muted flex items-center gap-1 mr-1">
            <Sparkles size={13} className="text-amber-500" />
            Catalog Item Under Transition:
          </span>
          {PRECONFIGURED_SKU_PAIRS.map((pair, idx) => (
            <button
              key={pair.oldSku}
              onClick={() => handleSelectPreset(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                selectedPresetIndex === idx
                  ? 'bg-[#4B164C] text-white border-[#4B164C] shadow-xs'
                  : 'bg-slate-50 text-text-secondary border-slate-200 hover:bg-slate-100 hover:text-text-primary'
              }`}
            >
              <span>{pair.productName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                selectedPresetIndex === idx ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {pair.oldSku.split('-')[1]} → {pair.newSku.split('-')[1]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* PRODUCT TRANSITION IDENTITY CARD */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Old SKU Box */}
        <div className="glass-card p-4 border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Phase-Out Target (Old SKU)
              </span>
              <span className="text-xs font-mono font-bold text-text-muted">{oldSkuDetails.sku}</span>
            </div>
            <h3 className="text-sm font-bold text-text-primary">{oldSkuDetails.name}</h3>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Unit Cost: ₹{oldSkuDetails.unitCost.toLocaleString('en-IN')} • Holding Cost: ₹{params.holdingCostPerUnitYear}/unit/yr
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-text-muted font-medium">Network On-Hand Stock:</span>
            <span className="font-extrabold text-[#4B164C] text-sm font-mono">
              {oldSkuDetails.currentInventory.toLocaleString('en-IN')} units
              <span className="text-xs font-normal text-text-muted ml-1.5">
                (≈{(oldSkuDetails.currentInventory / params.weeklyDemandRate).toFixed(1)} wks demand)
              </span>
            </span>
          </div>
        </div>

        {/* New SKU Box */}
        <div className="glass-card p-4 border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Phase-In Successor (New SKU)
              </span>
              <span className="text-xs font-mono font-bold text-text-muted">{newSkuDetails.sku}</span>
            </div>
            <h3 className="text-sm font-bold text-text-primary">{newSkuDetails.name}</h3>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Unit Cost: ₹{newSkuDetails.unitCost.toLocaleString('en-IN')} • Supplier Inbound Lead Time: {newSkuDetails.leadTimeWeeks} weeks
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-text-muted font-medium">Initial Batch On Order:</span>
            <span className="font-extrabold text-emerald-700 text-sm font-mono">
              {newSkuDetails.onOrderUnits.toLocaleString('en-IN')} units
              <span className="text-xs font-normal text-text-muted ml-1.5">
                (PO Delivery: Week {newSkuDetails.leadTimeWeeks})
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* TOP KPI CARDS FOR SELECTED STRATEGY */}
      {/* ================================================================ */}
      {activeStrategy && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Crossover Target */}
          <div className="glass-card p-4 space-y-1 border-t-2 border-t-[#4B164C]">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Crossover Date</span>
              <Calendar size={14} className="text-[#4B164C]" />
            </div>
            <p className="text-lg font-black text-text-primary tracking-tight">
              {activeStrategy.crossoverDate}
            </p>
            <p className="text-[10px] text-text-muted">
              When New SKU fulfills ≥50% market demand
            </p>
          </div>

          {/* Leftover Scrap Risk */}
          <div className="glass-card p-4 space-y-1 border-t-2 border-t-amber-500">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Leftover Scrap Loss</span>
              <Trash2 size={14} className="text-amber-600" />
            </div>
            <p className="text-lg font-black text-amber-700 tracking-tight">
              ₹{activeStrategy.oldSkuLeftoverCost.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-text-muted">
              {activeStrategy.oldSkuLeftoverUnits} obsolete units @ {100 - params.salvageScrapValuePercent}% write-off
            </p>
          </div>

          {/* Shortage Risk */}
          <div className="glass-card p-4 space-y-1 border-t-2 border-t-rose-500">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Stockout Risk</span>
              <ShieldAlert size={14} className="text-rose-600" />
            </div>
            <p className="text-lg font-black text-rose-700 tracking-tight">
              {activeStrategy.newSkuShortageRiskPercent}%
            </p>
            <p className="text-[10px] text-text-muted">
              Probability of order backorder during crossover
            </p>
          </div>

          {/* Service Level */}
          <div className="glass-card p-4 space-y-1 border-t-2 border-t-emerald-500">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Service Level</span>
              <CheckCircle2 size={14} className="text-emerald-600" />
            </div>
            <p className="text-lg font-black text-emerald-700 tracking-tight">
              {activeStrategy.projectedServiceLevelPercent}%
            </p>
            <p className="text-[10px] text-text-muted">
              Order fulfillment continuity guarantee
            </p>
          </div>

          {/* Cost Delta vs Balanced */}
          <div className="glass-card p-4 space-y-1 border-t-2 border-t-blue-500">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Cost vs Balanced</span>
              <TrendingUp size={14} className="text-blue-600" />
            </div>
            <p className="text-lg font-black text-text-primary tracking-tight">
              {activeStrategy.costDeltaVsBalanced === 0 ? (
                <span className="text-slate-600">₹0 (Baseline)</span>
              ) : activeStrategy.costDeltaVsBalanced > 0 ? (
                <span className="text-rose-600">
                  +₹{activeStrategy.costDeltaVsBalanced.toLocaleString('en-IN')}
                </span>
              ) : (
                <span className="text-emerald-600">
                  -₹{Math.abs(activeStrategy.costDeltaVsBalanced).toLocaleString('en-IN')}
                </span>
              )}
            </p>
            <p className="text-[10px] text-text-muted">
              Holding + scrap net impact variance
            </p>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* STRATEGY TABS SWITCHER */}
      {/* ================================================================ */}
      <div className="bg-white border border-surface-border p-2 rounded-2xl flex flex-wrap gap-2 shadow-xs">
        {(['balanced', 'aggressive', 'conservative'] as const).map((key) => {
          const s = strategies[key];
          const isActive = activeStrategyKey === key;
          return (
            <button
              key={key}
              onClick={() => setActiveStrategyKey(key)}
              className={`flex-1 min-w-[220px] p-3 rounded-xl border text-left transition-all relative ${
                isActive
                  ? 'bg-[#F8E7F6]/50 border-[#4B164C] shadow-sm'
                  : 'bg-white border-slate-100 hover:bg-slate-50 text-text-secondary'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isActive ? 'bg-[#4B164C] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {s.strategyName}
                </span>
                {key === 'balanced' && (
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    ★ Recommended
                  </span>
                )}
              </div>
              <p className="font-bold text-xs text-text-primary mt-1.5">{s.tagline}</p>
              <p className="text-[10px] text-text-muted line-clamp-1 mt-0.5">{s.description}</p>
            </button>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/* MAIN VISUALIZATION: RECHARTS AREA CHART */}
      {/* ================================================================ */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#4B164C]" />
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                12-Week Inventory Rundown & Ramp-Up Projection
              </h3>
            </div>
            <p className="text-base font-bold text-text-primary mt-0.5">
              {activeStrategy?.strategyName} Trajectory — Crossover at Week {crossoverWeek}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-amber-700 font-medium">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span> Old SKU Inventory
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> New SKU Inventory
            </span>
            <span className="flex items-center gap-1.5 text-purple-700 font-medium">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-purple-500 inline-block"></span> Crossover Point
            </span>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorOldSku" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorNewSku" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(val) => `${val}`}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${Number(value).toLocaleString()} units`,
                  name === 'oldSkuInventory' ? 'Old SKU Stock' : 'New SKU Stock',
                ]}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return `${label} (${item?.fullDate || ''}) • Weekly Demand: ${item?.marketDemand || 0} units`;
                }}
                contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(val) => (val === 'oldSkuInventory' ? 'Old SKU Stock Rundown' : 'New SKU Stock Ramp-Up')}
              />
              <ReferenceLine
                x={`Wk ${crossoverWeek}`}
                stroke="#4B164C"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `Crossover (Wk ${crossoverWeek})`,
                  fill: '#4B164C',
                  fontSize: 10,
                  position: 'top',
                  fontWeight: 700,
                }}
              />
              <Area
                type="monotone"
                dataKey="oldSkuInventory"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorOldSku)"
              />
              <Area
                type="monotone"
                dataKey="newSkuInventory"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorNewSku)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Strategy Context & Recommendation Callout */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-[#4B164C] flex items-center gap-1.5">
              <Info size={14} /> Operational Recommendation:
            </span>
            <p className="text-text-secondary leading-relaxed">
              {activeStrategy?.recommendationNote}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-text-muted font-bold uppercase">Feasibility Rating:</span>
            <Badge
              variant={activeStrategy?.feasibilityRating === 'high' ? 'green' : 'amber'}
              className="uppercase text-[10px] font-bold"
            >
              {activeStrategy?.feasibilityRating}
            </Badge>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* MULTI-LOCATION INVENTORY ALLOCATION */}
      {/* ================================================================ */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Warehouse size={16} className="text-[#4B164C]" />
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Multi-Facility Stock Distribution
              </h3>
              <p className="text-sm font-bold text-text-primary">
                Old SKU ({oldSkuDetails.sku}) Warehouse Ledger Balances
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              toast.success('Internal stock rebalance request logged for warehouse transfer.');
            }}
            className="text-xs text-[#4B164C] hover:underline font-bold flex items-center gap-1"
          >
            Rebalance Facilities <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {oldSkuDetails.locations.map((loc) => {
            const totalStock = oldSkuDetails.currentInventory;
            const pct = totalStock > 0 ? Math.round((loc.oldSkuStock / totalStock) * 100) : 0;
            const netAvailable = loc.oldSkuStock - loc.allocatedReserved;

            return (
              <div
                key={loc.locationId}
                className="p-4 rounded-xl border border-slate-100 bg-white shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-text-primary leading-tight">{loc.locationName}</p>
                    <p className="text-[10px] text-text-muted flex items-center gap-1">
                      <MapPin size={10} className="text-slate-400" /> {loc.city}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {pct}% network
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-1 bg-slate-50/70 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-[9px] text-text-muted uppercase font-bold">On-Hand</p>
                    <p className="text-xs font-bold text-text-primary font-mono">{loc.oldSkuStock}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-text-muted uppercase font-bold">Reserved</p>
                    <p className="text-xs font-bold text-amber-600 font-mono">{loc.allocatedReserved}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-text-muted uppercase font-bold">Net Avail</p>
                    <p className="text-xs font-bold text-emerald-600 font-mono">{netAvailable}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>Depletion rundown share</span>
                    <span>{loc.oldSkuStock} units</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#4B164C] h-1.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* SIDE-BY-SIDE STRATEGY COMPARISON TABLE */}
      {/* ================================================================ */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Strategy Trade-Off Matrix
            </h3>
            <p className="text-base font-bold text-text-primary mt-0.5">
              Side-by-Side Transition Strategy Analysis
            </p>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            Deterministic Financial Models
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="py-3 px-4 font-bold text-text-muted uppercase tracking-wider text-[10px] w-1/4">
                  Planning Metric
                </th>
                <th className="py-3 px-4 font-bold text-amber-900 uppercase tracking-wider text-[10px] w-1/4">
                  Aggressive (Fast Cut-Over)
                </th>
                <th className="py-3 px-4 font-bold text-[#4B164C] uppercase tracking-wider text-[10px] w-1/4 bg-[#F8E7F6]/40">
                  Balanced (Deplete-First) ★
                </th>
                <th className="py-3 px-4 font-bold text-blue-900 uppercase tracking-wider text-[10px] w-1/4">
                  Conservative (Dual Buffer)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {/* Cut-Over Timing */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-text-primary">Cut-Over Timing</td>
                <td className="py-3 px-4 font-mono font-bold text-amber-700">Week {strategies.aggressive.projectedCrossoverWeek}</td>
                <td className="py-3 px-4 font-mono font-bold text-[#4B164C] bg-[#F8E7F6]/20">
                  Week {strategies.balanced.projectedCrossoverWeek}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-blue-700">Week {strategies.conservative.projectedCrossoverWeek}</td>
              </tr>

              {/* Leftover Scrap Units */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-text-primary">Old-SKU Leftover Stock</td>
                <td className="py-3 px-4 font-mono font-bold text-rose-600">
                  {strategies.aggressive.oldSkuLeftoverUnits} units
                </td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-600 bg-[#F8E7F6]/20">
                  {strategies.balanced.oldSkuLeftoverUnits} units (Zero Scrap)
                </td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                  {strategies.conservative.oldSkuLeftoverUnits} units (Depleted)
                </td>
              </tr>

              {/* Leftover Scrap Loss */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-text-primary">Scrap Write-Off Cost (₹)</td>
                <td className="py-3 px-4 font-mono font-bold text-rose-600">
                  ₹{strategies.aggressive.oldSkuLeftoverCost.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-600 bg-[#F8E7F6]/20">
                  ₹{strategies.balanced.oldSkuLeftoverCost.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                  ₹{strategies.conservative.oldSkuLeftoverCost.toLocaleString('en-IN')}
                </td>
              </tr>

              {/* Stockout Risk */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-text-primary">Stockout Shortage Risk</td>
                <td className="py-3 px-4 font-mono font-bold text-amber-600">
                  {strategies.aggressive.newSkuShortageRiskPercent}% (Moderate)
                </td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-600 bg-[#F8E7F6]/20">
                  {strategies.balanced.newSkuShortageRiskPercent}% (Low)
                </td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                  {strategies.conservative.newSkuShortageRiskPercent}% (Negligible)
                </td>
              </tr>

              {/* Order Service Level */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-text-primary">Order Fulfillment Service Level</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-700">
                  {strategies.aggressive.projectedServiceLevelPercent}%
                </td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-700 bg-[#F8E7F6]/20">
                  {strategies.balanced.projectedServiceLevelPercent}%
                </td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                  {strategies.conservative.projectedServiceLevelPercent}%
                </td>
              </tr>

              {/* Carrying & Scrap Total */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-text-primary">Total Carrying & Scrap Cost</td>
                <td className="py-3 px-4 font-mono font-bold text-text-primary">
                  ₹{strategies.aggressive.totalCarryingAndScrapCost.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-[#4B164C] bg-[#F8E7F6]/20">
                  ₹{strategies.balanced.totalCarryingAndScrapCost.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-text-primary">
                  ₹{strategies.conservative.totalCarryingAndScrapCost.toLocaleString('en-IN')}
                </td>
              </tr>

              {/* Variance vs Balanced */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-text-primary">Cost Delta vs Balanced</td>
                <td className="py-3 px-4 font-mono font-bold text-rose-600">
                  +₹{strategies.aggressive.costDeltaVsBalanced.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-600 bg-[#F8E7F6]/20">
                  ₹0 (Baseline)
                </td>
                <td className="py-3 px-4 font-mono font-bold text-rose-600">
                  +₹{strategies.conservative.costDeltaVsBalanced.toLocaleString('en-IN')}
                </td>
              </tr>

              {/* Best Fit / Context */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-text-primary">Recommended Fit</td>
                <td className="py-3 px-4 text-text-secondary">
                  High-margin upgrade where customer adoption speed trumps inventory salvage.
                </td>
                <td className="py-3 px-4 text-text-secondary bg-[#F8E7F6]/20 font-medium">
                  Standard enterprise catalog migrations where eliminating scrap write-offs is prioritized.
                </td>
                <td className="py-3 px-4 text-text-secondary">
                  Mission-critical OEM components with zero downtime tolerance and high penalty clauses.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================ */}
      {/* ADJUSTABLE ASSUMPTIONS & TRANSPARENT LOGIC PANEL */}
      {/* ================================================================ */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-[#4B164C]" />
            <div>
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Rundown Assumptions & Parameters
              </h3>
              <p className="text-[11px] text-text-muted">
                Adjust demand velocity, lead times, or holding cost to simulate sensitivity
              </p>
            </div>
          </div>
          <button
            onClick={handleResetParams}
            className="btn-secondary text-xs px-3 py-1 gap-1.5"
          >
            <RefreshCw size={12} /> Reset Assumptions
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-1">
          {/* Weekly Demand Run-Rate */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">
              Weekly Market Demand (Units/Wk)
            </label>
            <input
              type="number"
              min="10"
              max="5000"
              value={params.weeklyDemandRate}
              onChange={(e) => setParams(p => ({ ...p, weeklyDemandRate: Math.max(1, Number(e.target.value)) }))}
              className="input-field py-1.5 h-9 text-xs w-full font-mono"
            />
          </div>

          {/* New SKU Lead Time */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">
              New SKU Inbound Lead Time (Weeks)
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={params.newSkuLeadTimeWeeks}
              onChange={(e) => setParams(p => ({ ...p, newSkuLeadTimeWeeks: Math.max(1, Number(e.target.value)) }))}
              className="input-field py-1.5 h-9 text-xs w-full font-mono"
            />
          </div>

          {/* Holding Cost */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">
              Unit Holding Cost / Year (₹)
            </label>
            <input
              type="number"
              min="0"
              value={params.holdingCostPerUnitYear}
              onChange={(e) => setParams(p => ({ ...p, holdingCostPerUnitYear: Math.max(0, Number(e.target.value)) }))}
              className="input-field py-1.5 h-9 text-xs w-full font-mono"
            />
          </div>

          {/* Salvage Scrap Recovery % */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <label className="font-bold text-text-muted uppercase">Scrap Salvage Recovery</label>
              <span className="font-bold text-[#4B164C]">{params.salvageScrapValuePercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={params.salvageScrapValuePercent}
              onChange={(e) => setParams(p => ({ ...p, salvageScrapValuePercent: Number(e.target.value) }))}
              className="w-full accent-[#4B164C] cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-text-muted">
              <span>0% (Full Write-Off)</span>
              <span>50% (High Salvage)</span>
            </div>
          </div>
        </div>

        {/* Baseline Calculation Logic Transparency */}
        <div className="p-3.5 bg-purple-50/50 border border-purple-100 rounded-xl text-[11px] text-[#4B164C] flex items-start gap-2.5">
          <Info size={16} className="shrink-0 text-[#4B164C] mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Transparent Ledger Model Disclosure:</p>
            <p className="text-text-secondary leading-relaxed">
              {transitionData.baselineCalculationNotes}
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 12-WEEK RUN-RATE FULFILLMENT SCHEDULE TABLE (DRILLDOWN) */}
      {/* ================================================================ */}
      <div className="glass-card p-6 space-y-4">
        <button
          onClick={() => setShowWeeklySchedule(!showWeeklySchedule)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#4B164C]" />
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Weekly Rundown & Fulfillment Ledger (12-Week Schedule)
              </h3>
              <p className="text-sm font-bold text-text-primary">
                Detailed weekly stock balances and fulfillment by SKU for {activeStrategy?.strategyName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#4B164C] font-semibold">
            <span>{showWeeklySchedule ? 'Collapse' : 'Expand'}</span>
            {showWeeklySchedule ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {showWeeklySchedule && (
          <div className="overflow-x-auto pt-2 animate-fade-in">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-2.5 px-3 font-bold text-text-muted text-[10px] uppercase">Week #</th>
                  <th className="py-2.5 px-3 font-bold text-text-muted text-[10px] uppercase">Calendar Date</th>
                  <th className="py-2.5 px-3 font-bold text-amber-700 text-[10px] uppercase">Old SKU Stock</th>
                  <th className="py-2.5 px-3 font-bold text-emerald-700 text-[10px] uppercase">New SKU Stock</th>
                  <th className="py-2.5 px-3 font-bold text-text-muted text-[10px] uppercase">Weekly Demand</th>
                  <th className="py-2.5 px-3 font-bold text-amber-700 text-[10px] uppercase">Old Fulfilled</th>
                  <th className="py-2.5 px-3 font-bold text-emerald-700 text-[10px] uppercase">New Fulfilled</th>
                  <th className="py-2.5 px-3 font-bold text-rose-700 text-[10px] uppercase">Unmet</th>
                  <th className="py-2.5 px-3 font-bold text-text-muted text-[10px] uppercase">Phase Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {activeStrategy?.timeline.map((point) => {
                  const isCrossover = point.week === crossoverWeek;
                  return (
                    <tr
                      key={point.week}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCrossover ? 'bg-[#F8E7F6]/40 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-text-primary">
                        Week {point.week}
                        {isCrossover && (
                          <span className="ml-1 text-[9px] bg-[#4B164C] text-white px-1.5 py-0.2 rounded font-sans uppercase">
                            Crossover
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-text-secondary">{point.date}</td>
                      <td className="py-2.5 px-3 text-amber-600 font-bold">{point.oldSkuInventory}</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold">{point.newSkuInventory}</td>
                      <td className="py-2.5 px-3 text-text-primary">{point.totalMarketDemand}</td>
                      <td className="py-2.5 px-3 text-amber-700">{point.oldSkuFulfillment}</td>
                      <td className="py-2.5 px-3 text-emerald-700">{point.newSkuFulfillment}</td>
                      <td className="py-2.5 px-3">
                        {point.unmetDemand > 0 ? (
                          <span className="text-rose-600 font-bold">+{point.unmetDemand}</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-[11px]">
                        {point.newSkuFulfillment > point.oldSkuFulfillment ? (
                          <span className="text-emerald-700 font-medium">New SKU Leading</span>
                        ) : point.oldSkuInventory === 0 ? (
                          <span className="text-slate-500">Old Stock Exhausted</span>
                        ) : (
                          <span className="text-amber-700 font-medium">Old SKU Rundown</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
