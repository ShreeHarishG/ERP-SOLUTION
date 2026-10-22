'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Radar,
  AlertTriangle,
  Shield,
  ShoppingCart,
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Filter,
  ChevronDown,
  Info,
  Zap,
  Package,
  Truck,
  BarChart3,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import { useAuth } from '@/hooks/useAuth';
import {
  RISK_TIER_CONFIG,
  DISRUPTION_CATEGORY_LABELS,
} from '@/types/onchain-insights';
import type {
  OnchainDashboardFilters,
  DisruptionSeverity,
  ActionUrgency,
  RiskTier,
} from '@/types/onchain-insights';
import { format } from 'date-fns';

// --- Helpers ---
const severityBadge = (severity: DisruptionSeverity) => {
  const map: Record<DisruptionSeverity, 'red' | 'amber' | 'blue' | 'green'> = {
    critical: 'red',
    high: 'amber',
    medium: 'blue',
    low: 'green',
  };
  return map[severity];
};

const urgencyConfig: Record<ActionUrgency, { label: string; dot: string; bg: string; text: string }> = {
  immediate: { label: 'Immediate', dot: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-700' },
  urgent:    { label: 'Urgent',    dot: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
  standard:  { label: 'Standard',  dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  planned:   { label: 'Planned',   dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-700' },
};

const PIE_COLORS: Record<RiskTier, string> = {
  critical: '#e11d48',
  high: '#ea580c',
  medium: '#d97706',
  low: '#059669',
};

// --- Tooltip Components ---
const RiskTrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-surface-border rounded-lg shadow-lg p-3 text-xs space-y-1.5">
      <p className="font-bold text-text-primary">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#4B164C]" />
        <span className="text-text-secondary">Risk Score:</span>
        <span className="font-bold text-[#4B164C]">{payload[0]?.value}</span>
      </div>
      {payload[1] && (
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-text-secondary">Disruptions:</span>
          <span className="font-bold text-rose-600">{payload[1]?.value}</span>
        </div>
      )}
    </div>
  );
};

export default function OnchainInsightsPage() {
  const { user } = useAuth();
  const { useDashboard } = useOnchainInsights();

  // --- Filter state ---
  const [filters, setFilters] = useState<OnchainDashboardFilters>({
    dateRange: '30d',
    riskLevel: 'all',
    supplierId: 'all',
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } = useDashboard(filters);

  // --- Loading State ---
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (isError || !data) {
    return (
      <div className="p-12 text-center border border-rose-200/50 bg-rose-50/50 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
        <h3 className="font-bold text-base text-rose-800">Failed to Load Onchain Insights</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">
          Could not fetch supply chain intelligence data. This may be a network issue.
        </p>
        <button onClick={() => refetch()} className="btn-primary bg-rose-600 hover:bg-rose-700">
          Retry
        </button>
      </div>
    );
  }

  const { kpis, disruptions, supplierRiskDistribution, shipmentRiskTrend, affectedMaterials, recommendedActions, suppliers } = data;

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white border border-surface-border p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <Breadcrumbs items={[{ label: 'Onchain Insights' }]} />
          <div className="flex items-center gap-3 mt-1">
            <h1 className="page-title text-2xl font-bold tracking-tight text-[#4B164C]">
              Supply Chain Intelligence
            </h1>
            <Badge className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 bg-[#F8E7F6] text-[#4B164C] border border-brand-accent/20">
              Onchain Insights
            </Badge>
          </div>
          <p className="page-subtitle text-xs text-text-muted">
            Real-time disruption monitoring, supplier risk assessment, and recovery planning
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Demo Data Indicator */}
          {data.dataMode === 'mock' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
              <Info size={12} />
              Demo Data
            </div>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-secondary text-xs px-3 py-1.5 gap-1.5"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* FILTERS BAR */}
      {/* ================================================================ */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-primary transition-colors"
          >
            <Filter size={14} />
            Filters
            <ChevronDown size={12} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className="h-5 w-px bg-surface-border" />

          {/* Date Range Selector */}
          <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100 p-0.5">
            {(['7d', '30d', '60d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setFilters(f => ({ ...f, dateRange: range }))}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                  filters.dateRange === range
                    ? 'bg-[#4B164C] text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {range.replace('d', ' Days')}
              </button>
            ))}
          </div>

          {/* Risk Level Filter */}
          <select
            value={filters.riskLevel}
            onChange={(e) => setFilters(f => ({ ...f, riskLevel: e.target.value as any }))}
            className="input-field py-1.5 px-3 h-8 text-[11px] font-semibold w-36"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          {/* Supplier Filter */}
          <select
            value={filters.supplierId}
            onChange={(e) => setFilters(f => ({ ...f, supplierId: e.target.value }))}
            className="input-field py-1.5 px-3 h-8 text-[11px] font-semibold w-48"
          >
            <option value="all">All Suppliers</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {filters.riskLevel !== 'all' || filters.supplierId !== 'all' ? (
            <button
              onClick={() => setFilters(f => ({ ...f, riskLevel: 'all', supplierId: 'all' }))}
              className="text-[10px] font-bold text-brand-primary hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {/* ================================================================ */}
      {/* KPI STRIP */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Active Disruptions */}
        <div className="kpi-card flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Active Disruptions</p>
            <p className="text-2xl font-bold text-rose-600 tracking-tight">{kpis.activeDisruptions}</p>
            <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5">
              <AlertTriangle size={11} /> Requiring attention
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0 group-hover:scale-110 transition-transform">
            <Zap size={22} />
          </div>
        </div>

        {/* At-Risk Suppliers */}
        <div className="kpi-card flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">At-Risk Suppliers</p>
            <p className="text-2xl font-bold text-orange-600 tracking-tight">{kpis.atRiskSuppliers}</p>
            <p className="text-[10px] text-orange-500 font-semibold flex items-center gap-0.5">
              <Shield size={11} /> Critical or High risk
            </p>
          </div>
          <div className="p-3 rounded-xl bg-orange-50 text-orange-600 shrink-0 group-hover:scale-110 transition-transform">
            <Shield size={22} />
          </div>
        </div>

        {/* Affected Orders */}
        <div className="kpi-card flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Affected Orders</p>
            <p className="text-2xl font-bold text-text-primary tracking-tight">{kpis.affectedOrders}</p>
            <p className="text-[10px] text-text-muted font-semibold flex items-center gap-0.5">
              <ShoppingCart size={11} /> Linked to disruptions
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0 group-hover:scale-110 transition-transform">
            <ShoppingCart size={22} />
          </div>
        </div>

        {/* Avg Risk Score */}
        <div className="kpi-card flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Avg Risk Score</p>
            <p className="text-2xl font-bold text-[#4B164C] tracking-tight">{kpis.avgRiskScore}<span className="text-sm text-text-muted">/100</span></p>
            <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
              <Activity size={11} /> Across all suppliers
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#F8E7F6] text-[#4B164C] shrink-0 group-hover:scale-110 transition-transform">
            <BarChart3 size={22} />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="kpi-card flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Pending Approvals</p>
            <p className="text-2xl font-bold text-blue-600 tracking-tight">{kpis.pendingApprovals}</p>
            <p className="text-[10px] text-blue-500 font-semibold flex items-center gap-0.5">
              <Clock size={11} /> Awaiting review
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="kpi-card flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Recommended Actions</p>
            <p className="text-2xl font-bold text-emerald-600 tracking-tight">{kpis.recommendedActions}</p>
            <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
              <TrendingUp size={11} /> Available mitigations
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* ROW 2: RISK TREND CHART + SUPPLIER PIE */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipment Risk Trend (Area Chart) */}
        <div className="glass-card p-5 space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Risk Monitoring</h3>
              <p className="text-lg font-bold text-text-primary mt-0.5">
                Shipment Risk Trend
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-[9px] font-bold text-text-muted">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#4B164C]" /> Risk Score</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Active Disruptions</div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={shipmentRiskTrend} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4B164C" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4B164C" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="disruptionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: '#a396a1', fontWeight: 600 }}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                  interval={Math.floor(shipmentRiskTrend.length / 8)}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#a396a1', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip content={<RiskTrendTooltip />} />
                <Area
                  type="monotone"
                  dataKey="riskScore"
                  stroke="#4B164C"
                  strokeWidth={2}
                  fill="url(#riskGradient)"
                  name="Risk Score"
                />
                <Area
                  type="monotone"
                  dataKey="activeDisruptions"
                  stroke="#e11d48"
                  strokeWidth={1.5}
                  fill="url(#disruptionGradient)"
                  name="Disruptions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier Risk Distribution (Pie/Donut) */}
        <div className="glass-card p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Risk Distribution</h3>
            <p className="text-lg font-bold text-text-primary mt-0.5">
              Supplier Risk Tiers
            </p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={supplierRiskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="tier"
                  strokeWidth={2}
                  stroke="#ffffff"
                >
                  {supplierRiskDistribution.map((entry) => (
                    <Cell key={entry.tier} fill={PIE_COLORS[entry.tier]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value ?? 0} supplier${value !== 1 ? 's' : ''}`,
                    typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : String(name || '')
                  ]}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: any) => (
                    <span className="text-[10px] font-semibold text-text-secondary capitalize">{String(value)}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Summary counts below pie */}
          <div className="grid grid-cols-4 gap-1.5">
            {supplierRiskDistribution.map(d => (
              <div key={d.tier} className={`text-center p-1.5 rounded-lg ${RISK_TIER_CONFIG[d.tier].bg} border ${RISK_TIER_CONFIG[d.tier].border}`}>
                <p className={`text-lg font-bold ${RISK_TIER_CONFIG[d.tier].color}`}>{d.count}</p>
                <p className="text-[8px] font-bold uppercase tracking-wider text-text-muted">{d.tier}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* ROW 3: ACTIVE DISRUPTIONS FEED + RECOMMENDED ACTIONS */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Disruption Alerts Feed */}
        <div className="glass-card p-5 space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Live Intelligence</h3>
              <p className="text-lg font-bold text-text-primary mt-0.5 flex items-center gap-2">
                Active Disruption Signals
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </p>
            </div>
            <span className="text-[10px] font-bold text-text-muted bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              {disruptions.length} signal{disruptions.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {disruptions.length === 0 ? (
              <div className="text-center py-10 text-text-muted">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400" />
                <p className="text-sm font-semibold">No disruptions match the current filters</p>
              </div>
            ) : (
              disruptions.map((d, idx) => (
                <div
                  key={d.id}
                  className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
                    d.severity === 'critical' ? 'border-rose-200 bg-rose-50/30' :
                    d.severity === 'high' ? 'border-orange-200 bg-orange-50/20' :
                    'border-slate-100 bg-slate-50/30'
                  }`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={severityBadge(d.severity)}>
                          {d.severity}
                        </Badge>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          {DISRUPTION_CATEGORY_LABELS[d.category]}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          d.status === 'active' ? 'bg-rose-100 text-rose-700' :
                          d.status === 'acknowledged' ? 'bg-amber-100 text-amber-700' :
                          d.status === 'monitoring' ? 'bg-blue-100 text-blue-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {d.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-text-primary leading-tight">
                        {d.title}
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                        {d.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-text-muted font-medium pt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {format(new Date(d.detectedAt), 'MMM d, h:mm a')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package size={10} />
                          {d.affectedMaterials.length} material{d.affectedMaterials.length !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingCart size={10} />
                          {d.affectedOrders.length} order{d.affectedOrders.length !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck size={10} />
                          {d.affectedShipments.length} shipment{d.affectedShipments.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {d.estimatedImpact && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg w-fit mt-1">
                          <AlertTriangle size={10} />
                          Impact: {d.estimatedImpact}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="glass-card p-5 space-y-4 lg:col-span-2">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Recovery Planning</h3>
            <p className="text-lg font-bold text-text-primary mt-0.5">
              Recommended Actions
            </p>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {recommendedActions.map((action, idx) => {
              const uc = urgencyConfig[action.urgency];
              return (
                <div
                  key={action.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-white hover:shadow-sm hover:border-slate-200 transition-all space-y-2.5"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${uc.dot} shrink-0`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${uc.bg} ${uc.text}`}>
                        {uc.label}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-text-muted bg-slate-50 px-1.5 py-0.5 rounded capitalize">
                      {action.actionType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-text-primary leading-tight">
                    {action.title}
                  </h4>
                  <p className="text-[10px] text-text-secondary leading-relaxed line-clamp-2">
                    {action.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-2">
                      <p className="font-bold text-emerald-700">{action.estimatedBenefit}</p>
                      <p className="text-text-muted">Est. Benefit</p>
                    </div>
                    <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-2">
                      <p className="font-bold text-rose-700">{action.estimatedCost}</p>
                      <p className="text-text-muted">Est. Cost</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-text-muted pt-0.5 border-t border-slate-50">
                    <span className="font-semibold">{action.relatedSupplier}</span>
                    <span className="font-bold text-brand-primary">{action.affectedOrders} order{action.affectedOrders !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* ROW 4: AFFECTED MATERIALS TABLE */}
      {/* ================================================================ */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Impact Assessment</h3>
            <p className="text-lg font-bold text-text-primary mt-0.5">
              Affected Materials & Orders
            </p>
          </div>
          <span className="text-[10px] font-bold text-text-muted bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            {affectedMaterials.length} material{affectedMaterials.length !== 1 ? 's' : ''} impacted
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="erp-table text-xs">
            <thead>
              <tr>
                <th>Material</th>
                <th>SKU</th>
                <th>Supplier</th>
                <th>Disruption</th>
                <th>Severity</th>
                <th className="text-center">Affected Orders</th>
                <th className="text-center">Est. Delay</th>
              </tr>
            </thead>
            <tbody>
              {affectedMaterials.map((mat) => (
                <tr key={mat.id}>
                  <td className="font-bold text-text-primary">{mat.materialName}</td>
                  <td className="font-mono text-text-secondary">{mat.sku}</td>
                  <td className="text-text-secondary">{mat.supplierName}</td>
                  <td className="text-text-secondary max-w-[200px] truncate" title={mat.disruptionTitle}>
                    {mat.disruptionTitle}
                  </td>
                  <td>
                    <Badge variant={severityBadge(mat.severity)}>
                      {mat.severity}
                    </Badge>
                  </td>
                  <td className="text-center">
                    <span className="font-bold text-text-primary">{mat.affectedOrderCount}</span>
                  </td>
                  <td className="text-center">
                    <span className={`font-bold ${mat.estimatedDelayDays > 5 ? 'text-rose-600' : mat.estimatedDelayDays > 3 ? 'text-amber-600' : 'text-text-primary'}`}>
                      {mat.estimatedDelayDays} days
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================ */}
      {/* ROW 5: SUPPLIER RISK OVERVIEW */}
      {/* ================================================================ */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Supplier Overview</h3>
            <p className="text-lg font-bold text-text-primary mt-0.5">
              Supplier Risk Portfolio
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {suppliers.map(supplier => {
            const tierCfg = RISK_TIER_CONFIG[supplier.riskTier];
            return (
              <div
                key={supplier.id}
                className={`p-4 rounded-xl border ${tierCfg.border} ${tierCfg.bg}/30 hover:shadow-sm transition-all space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-text-primary truncate">{supplier.name}</h4>
                  <Badge variant={severityBadge(supplier.riskTier)}>
                    {supplier.riskTier}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-text-muted font-medium">Risk Score</span>
                    <span className={`font-bold ${tierCfg.color}`}>{supplier.riskScore}/100</span>
                  </div>
                  {/* Risk score bar */}
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        supplier.riskTier === 'critical' ? 'bg-rose-500' :
                        supplier.riskTier === 'high' ? 'bg-orange-500' :
                        supplier.riskTier === 'medium' ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${supplier.riskScore}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-text-muted font-medium">{supplier.location}</span>
                    <span className="text-text-muted font-medium">{supplier.materialsSupplied.length} materials</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* FOOTER INFO */}
      {/* ================================================================ */}
      {data.dataMode === 'mock' && (
        <div className="flex items-center gap-2 text-[10px] text-amber-700 bg-amber-50/50 border border-amber-100 rounded-lg px-4 py-2.5">
          <Info size={12} className="shrink-0" />
          <span className="font-medium">
            This dashboard is running in <strong>demo mode</strong> with simulated data. Supply chain intelligence data will be sourced from configured APIs when available.
            Configure <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[9px]">NEXT_PUBLIC_ONCHAIN_DATA_MODE=api</code> to switch to live data.
          </span>
        </div>
      )}
    </div>
  );
}
