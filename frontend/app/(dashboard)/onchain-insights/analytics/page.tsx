'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  LineChart,
  BarChart3,
  TrendingUp,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Sparkles,
  Calendar,
  Layers,
  Building2,
  DollarSign,
  ChevronRight,
  Info,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  ReferenceLine,
} from 'recharts';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import { Modal } from '@/components/ui/Modal';
import type {
  DisruptionOutcomeRecord,
  PostMortemRecord,
  OutcomeFinalStatus,
  DisruptionCategory,
  PostMortemSubmissionPayload,
  OutcomeAnalyticsFilterParams,
} from '@/types/onchain-insights';
import {
  DISRUPTION_CATEGORY_CONFIG,
  OUTCOME_STATUS_CONFIG,
} from '@/types/onchain-insights';

const PIE_COLORS: Record<string, string> = {
  resolved_ontime: '#10b981', // emerald-500
  resolved_delayed: '#f59e0b', // amber-500
  cost_overrun: '#f97316',    // orange-500
  sla_breached: '#ef4444',    // rose-500
  escalated: '#8b5cf6',       // purple-500
};

export default function OutcomeAnalyticsPage() {
  const { useOutcomeAnalytics, useSubmitPostMortem } = useOnchainInsights();

  // Filter state
  const [dateRange, setDateRange] = useState<'3m' | '6m' | '12m' | 'all'>('12m');
  const [selectedCategory, setSelectedCategory] = useState<DisruptionCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<OutcomeFinalStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'trends' | 'financials' | 'suppliers' | 'patterns'>('trends');

  // Modal states
  const [viewingPostMortem, setViewingPostMortem] = useState<PostMortemRecord | null>(null);
  const [conductingForOutcome, setConductingForOutcome] = useState<DisruptionOutcomeRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New post-mortem form state
  const [pmFacilitator, setPmFacilitator] = useState('Priya Iyer (Head Procurement)');
  const [pmParticipants, setPmParticipants] = useState('Rajesh Sharma, Amitabh Sen, Deepak Verma');
  const [pmRootCategory, setPmRootCategory] = useState<PostMortemSubmissionPayload['rootCauseCategory']>('single_source_failure');
  const [pmSummary, setPmSummary] = useState('');
  const [pmWhy1, setPmWhy1] = useState('');
  const [pmWhy2, setPmWhy2] = useState('');
  const [pmWhy3, setPmWhy3] = useState('');
  const [pmWhy4, setPmWhy4] = useState('');
  const [pmWhy5, setPmWhy5] = useState('');
  const [pmWentWell, setPmWentWell] = useState('');
  const [pmWentWrong, setPmWentWrong] = useState('');
  const [pmPolicy, setPmPolicy] = useState('');
  const [pmActionItem, setPmActionItem] = useState({
    action: '',
    owner: '',
    dueDate: '',
    impactArea: 'Procurement Strategy',
  });

  // Query API
  const queryFilters: OutcomeAnalyticsFilterParams = useMemo(() => ({
    dateRange,
    category: selectedCategory,
    finalStatus: selectedStatus,
    search: searchQuery,
  }), [dateRange, selectedCategory, selectedStatus, searchQuery]);

  const { data, isLoading, error, refetch } = useOutcomeAnalytics(queryFilters);
  const submitPostMortemMutation = useSubmitPostMortem();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openConductModal = (outcome: DisruptionOutcomeRecord) => {
    setConductingForOutcome(outcome);
    setPmSummary(`Root cause analysis for ${outcome.title}. Incident occurred on ${outcome.incidentDate} affecting ${outcome.affectedMaterial}.`);
    setPmWhy1(`Assembly line experienced shortages of ${outcome.affectedMaterial}.`);
    setPmWhy2(`Supplier ${outcome.primarySupplierName} had severe disruption due to ${outcome.category}.`);
    setPmWhy3('Buffer inventory was depleted within 48 hours without immediate secondary source dispatch.');
    setPmWhy4('Procurement policy did not enforce dual-source allocation threshold for this critical material.');
    setPmWhy5('Cost minimization metrics prioritized single-source volume discounts over continuity safeguards.');
    setPmWentWell('Fast cross-functional response executed alternate decision within SLA.');
    setPmWentWrong('Expedited logistics incurred premium freight costs.');
    setPmPolicy(`Mandatory resilience threshold: All single-source components for ${outcome.affectedMaterial} require secondary supplier qualification and 21-day regional buffer.`);
    setPmActionItem({
      action: `Establish secondary supplier trial allocation for ${outcome.affectedMaterial}`,
      owner: 'Procurement Specialist',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      impactArea: 'Dual-Sourcing',
    });
  };

  const handlePostMortemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conductingForOutcome) return;

    try {
      const payload: PostMortemSubmissionPayload = {
        outcomeId: conductingForOutcome.id,
        facilitator: pmFacilitator,
        participants: pmParticipants.split(',').map((p) => p.trim()).filter(Boolean),
        rootCauseCategory: pmRootCategory,
        rootCauseSummary: pmSummary,
        fiveWhys: {
          why1: pmWhy1,
          why2: pmWhy2,
          why3: pmWhy3,
          why4: pmWhy4,
          why5: pmWhy5,
        },
        whatWentWell: pmWentWell.split('\n').map((s) => s.trim()).filter(Boolean),
        whatWentWrong: pmWentWrong.split('\n').map((s) => s.trim()).filter(Boolean),
        preventivePolicy: pmPolicy,
        actionItems: [
          {
            action: pmActionItem.action || `Audit alternate sourcing for ${conductingForOutcome.affectedMaterial}`,
            owner: pmActionItem.owner || 'Procurement Specialist',
            dueDate: pmActionItem.dueDate || new Date().toISOString().split('T')[0],
            status: 'pending',
            impactArea: pmActionItem.impactArea,
          },
        ],
        status: 'completed',
      };

      await submitPostMortemMutation.mutateAsync(payload);
      setConductingForOutcome(null);
      showToast('Post-mortem review successfully recorded and archived to audit log.');
    } catch (err) {
      console.error(err);
      showToast('Failed to record post-mortem review.');
    }
  };

  // Pie chart data
  const statusPieData = useMemo(() => {
    if (!data?.outcomes) return [];
    const counts: Record<string, number> = {};
    data.outcomes.forEach((o) => {
      counts[o.finalStatus] = (counts[o.finalStatus] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: OUTCOME_STATUS_CONFIG[status as OutcomeFinalStatus]?.label || status,
      key: status,
      value,
    }));
  }, [data]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 animate-slide-up">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Task 12: Continuous Improvement
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              Historical Retrospective
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Outcome Analytics & Post-Mortem Lab
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Review historical incident recovery speeds, evaluate mitigation cost-benefit ROI, and record structured 5-Whys post-mortem reviews.
          </p>
        </div>

        {/* Disclaimer / Simulation boundary badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <Info size={16} className="text-amber-600 shrink-0" />
            <span>
              <strong>Simulated Benchmarks:</strong> Historical recovery metrics are calculated deterministically.
            </span>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-surface-border rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mean Recovery Days */}
        <div className="bg-white rounded-xl border border-surface-border p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Mean Recovery Time</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary">
              {data ? `${data.kpis.meanRecoveryDurationDays} Days` : '...'}
            </span>
            <span className="text-xs text-text-secondary">
              (Target: {data?.kpis.meanRecoveryTargetDays || 5.5}d)
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <ArrowDownRight size={14} />
            <span>On-target response across {data?.kpis.totalIncidentsAnalyzed || 0} resolved incidents</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-50/50 rounded-full pointer-events-none" />
        </div>

        {/* SLA Adherence Rate */}
        <div className="bg-white rounded-xl border border-surface-border p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">SLA Adherence Rate</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">
              {data ? `${data.kpis.slaAdherenceRatePercent}%` : '...'}
            </span>
            <span className="text-xs text-text-secondary">on-time resolution</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 size={14} />
            <span>Target benchmark: &gt;80% resolution adherence</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-50/50 rounded-full pointer-events-none" />
        </div>

        {/* Financial Benefit (Penalties Avoided vs Spend) */}
        <div className="bg-white rounded-xl border border-surface-border p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Financial Protection</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-text-primary">
              ₹{data ? data.kpis.netAvoidanceValueINR.toLocaleString('en-IN') : '...'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Spent: ₹{data ? data.kpis.totalMitigationSpendINR.toLocaleString('en-IN') : '...'}</span>
            <span className="text-emerald-700 font-medium">Avoided: ₹{data ? data.kpis.totalPenaltiesAvoidedINR.toLocaleString('en-IN') : '...'}</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-50/50 rounded-full pointer-events-none" />
        </div>

        {/* Post-Mortem Completion & Risk Clusters */}
        <div className="bg-white rounded-xl border border-surface-border p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Post-Mortem Coverage</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-700">
              {data ? `${data.kpis.postMortemCompletionRatePercent}%` : '...'}
            </span>
            <span className="text-xs text-text-secondary">
              ({data?.postMortems.length || 0} documented)
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600 font-medium">
            <Layers size={14} />
            <span>{data?.kpis.recurringRiskClustersCount || 0} systemic recurring clusters mapped</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-indigo-50/50 rounded-full pointer-events-none" />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-surface-border p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search input */}
          <div className="relative min-w-[220px]">
            <Search size={15} className="absolute left-3 top-2.5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search incident, material, supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          {/* Time range buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-surface-border text-xs">
            {(['3m', '6m', '12m', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  dateRange === r ? 'bg-white text-brand-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {r === '3m' ? '3M' : r === '6m' ? '6M' : r === '12m' ? '12M' : 'All'}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-text-secondary font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-slate-50 border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
            >
              <option value="all">All Categories</option>
              {Object.entries(DISRUPTION_CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-text-secondary font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-slate-50 border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
            >
              <option value="all">All Outcomes</option>
              {Object.entries(OUTCOME_STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick action: View recurring patterns shortcut */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }}
            className="text-xs text-brand-primary hover:underline font-medium px-2 py-1"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Visual Analytics Tabs & Charts Section */}
      <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-surface-border px-5 pt-3">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('trends')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'trends'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <TrendingUp size={16} />
              Recovery Speed & Volume Trends
            </button>
            <button
              onClick={() => setActiveTab('financials')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'financials'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <DollarSign size={16} />
              Financial Protection Trade-Offs
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'suppliers'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Building2 size={16} />
              Supplier Resilience Scorecard
            </button>
            <button
              onClick={() => setActiveTab('patterns')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'patterns'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <ShieldAlert size={16} />
              Recurring Risk Pattern Clusters
            </button>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6">
          {/* TAB 1: Recovery Speed & Volume Trends */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Monthly Disruption Resolution Volume vs. Mean Recovery Days
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Compares number of closed disruption incidents against average days to recovery. Benchmark line marks target 5.5-day threshold.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />
                    <span className="text-text-secondary">Resolved Incidents</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-amber-500 inline-block" />
                    <span className="text-text-secondary">Mean Recovery Days</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data?.monthlyTrends || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} label={{ value: 'Incidents', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 11 } }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} unit="d" label={{ value: 'Avg Days', angle: 90, position: 'insideRight', style: { fill: '#64748b', fontSize: 11 } }} />
                    <Tooltip
                      formatter={(val: any, name: any) => {
                        if (name === 'avgRecoveryDays') return [`${val} Days`, 'Mean Recovery'];
                        if (name === 'incidentsResolved') return [`${val} Incidents`, 'Resolved Count'];
                        return [val, String(name ?? '')];
                      }}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <ReferenceLine yAxisId="right" y={5.5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'SLA Target (5.5d)', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                    <Bar yAxisId="left" dataKey="incidentsResolved" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={28} />
                    <Line yAxisId="right" type="monotone" dataKey="avgRecoveryDays" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Status Breakdown Donut alongside Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-surface-border">
                <div className="h-48 md:col-span-1 flex flex-col items-center justify-center">
                  <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">Outcome Distribution</h4>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={56}
                        paddingAngle={4}
                      >
                        {statusPieData.map((entry) => (
                          <Cell key={entry.key} fill={PIE_COLORS[entry.key] || '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="md:col-span-2 flex flex-col justify-center space-y-2">
                  <h4 className="text-xs font-semibold text-text-secondary uppercase">Operational Takeaway</h4>
                  <p className="text-xs text-text-primary leading-relaxed">
                    Over the recorded 12-month window, <strong className="text-emerald-700">{data?.kpis.slaAdherenceRatePercent}%</strong> of disruptions were successfully contained inside agreed SLA delivery limits. The longest average recovery durations occurred during July–August (Monsoon season) and January (chemical supply shocks).
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {statusPieData.map((item) => (
                      <span key={item.key} className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded bg-slate-50 border border-slate-200">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[item.key] }} />
                        <span className="font-medium text-slate-700">{item.name}:</span>
                        <span className="font-bold text-slate-900">{item.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Financial Protection Trade-Offs */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Financial Impact: Mitigation Cost Incurred vs. SLA Penalties Avoided
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Evaluating the cost-effectiveness of mitigation decisions in Indian Rupee (₹). Net avoided penalties confirm positive intervention ROI.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-rose-400 inline-block" />
                    <span className="text-text-secondary">Mitigation Spend (₹)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                    <span className="text-text-secondary">Penalties Avoided (₹)</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.monthlyTrends || []} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                    />
                    <Tooltip
                      formatter={(val: any, name: any) => {
                        const formatted = `₹${Number(val).toLocaleString('en-IN')}`;
                        if (name === 'mitigationCostINR') return [formatted, 'Mitigation Spend'];
                        if (name === 'penaltiesAvoidedINR') return [formatted, 'Penalties Avoided'];
                        return [formatted, String(name ?? '')];
                      }}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, borderColor: '#e2e8f0', fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar dataKey="mitigationCostINR" name="Mitigation Spend" fill="#fb7185" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="penaltiesAvoidedINR" name="Penalties Avoided" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-text-secondary block">Total Mitigation Outlay:</span>
                  <span className="text-base font-bold text-slate-900">
                    ₹{data?.kpis.totalMitigationSpendINR.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Expedited freight, alternate lot premiums, retooling subsidies</p>
                </div>
                <div>
                  <span className="text-text-secondary block">Gross Avoided Penalties:</span>
                  <span className="text-base font-bold text-emerald-700">
                    ₹{data?.kpis.totalPenaltiesAvoidedINR.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Customer SLA breach fines & line stoppage overheads prevented</p>
                </div>
                <div>
                  <span className="text-text-secondary block">Net Financial Protection (ROI):</span>
                  <span className="text-base font-bold text-purple-700">
                    ₹{data?.kpis.netAvoidanceValueINR.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[11px] text-purple-600 mt-0.5">₹3.88 saved per ₹1 spent on rapid mitigation</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Supplier Resilience Scorecard */}
          {activeTab === 'suppliers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Historical Supplier Resilience & Mean Recovery Speed
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Evaluation of vendor reliability during incident occurrences. Resilience score (0–100) measures turnaround efficiency and SLA adherence.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-72">
                  <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">Resilience Score by Supplier (0–100)</h4>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart
                      layout="vertical"
                      data={data?.supplierResilience || []}
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis
                        type="category"
                        dataKey="supplierName"
                        tick={{ fontSize: 10, fill: '#1e293b' }}
                        width={130}
                      />
                      <Tooltip
                        formatter={(val: any) => [`${val} / 100`, 'Resilience Index']}
                        contentStyle={{ fontSize: 12, borderRadius: 6 }}
                      />
                      <Bar dataKey="resilienceScore" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto">
                  <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">Historical Vendor Adherence Log</h4>
                  <table className="w-full text-left text-xs border border-surface-border rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 text-text-secondary border-b border-surface-border font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Supplier Name</th>
                        <th className="py-2.5 px-3 text-center">Incidents</th>
                        <th className="py-2.5 px-3 text-center">Avg Days</th>
                        <th className="py-2.5 px-3 text-center">SLA Met</th>
                        <th className="py-2.5 px-3 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {data?.supplierResilience.map((sup) => (
                        <tr key={sup.supplierId} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-medium text-text-primary">
                            <Link href={`/onchain-insights/suppliers/${sup.supplierId}`} className="hover:text-brand-primary hover:underline flex items-center gap-1">
                              {sup.supplierName}
                              <ExternalLink size={11} className="text-slate-400" />
                            </Link>
                          </td>
                          <td className="py-2.5 px-3 text-center text-text-secondary">{sup.incidentsInvolved}</td>
                          <td className="py-2.5 px-3 text-center font-medium">{sup.avgRecoveryDays}d</td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                sup.slaAdherenceRate >= 80
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : sup.slaAdherenceRate >= 50
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {sup.slaAdherenceRate}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                            {sup.resilienceScore}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Recurring Risk Pattern Clusters */}
          {activeTab === 'patterns' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Identified Systemic Risk Patterns & Recurring Bottlenecks
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Aggregated clustering of chronic disruption vectors across multi-tier dependencies. Strategic remedies inform annual procurement policy.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {data?.recurringPatterns.map((pat) => (
                  <div
                    key={pat.id}
                    className="p-5 rounded-xl border border-surface-border bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                          <ShieldAlert size={16} />
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{pat.clusterName}</h4>
                          <span className="text-[11px] text-slate-500">
                            Pattern Cluster #{pat.id} • Frequency: {pat.frequencyCount} incidents
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          pat.riskLevel === 'critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : pat.riskLevel === 'high'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {pat.riskLevel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Financial Exposure:</span>
                        <span className="font-bold text-slate-800">₹{pat.totalExposureINR.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Avg Recovery Delay:</span>
                        <span className="font-bold text-slate-800">{pat.averageRecoveryDays} Days</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-700 block">Systemic Vulnerability:</span>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {pat.systemicVulnerability}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-[11px] font-semibold text-emerald-900 flex items-center gap-1 mb-0.5">
                        <Sparkles size={13} className="text-emerald-600" />
                        Recommended Strategic Remedy:
                      </span>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        {pat.strategicRemedy}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Affected: {pat.affectedSuppliers.join(', ')}</span>
                      <span className="font-medium text-slate-700">Trend: {pat.recurrenceTrend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historical Incidents & Outcomes Table */}
      <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-text-primary">
              Historical Disruption Resolution Log ({data?.outcomes.length || 0})
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Comprehensive mapping from disruption signal → mitigation decision → financial cost-benefit → post-mortem retrospective.
            </p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Showing all closed incidents
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-text-secondary border-b border-surface-border font-semibold">
              <tr>
                <th className="py-3 px-4">Incident & Material</th>
                <th className="py-3 px-4">Primary Supplier</th>
                <th className="py-3 px-4">Decision Taken</th>
                <th className="py-3 px-4 text-center">Recovery vs. SLA</th>
                <th className="py-3 px-4 text-right">Cost vs. Avoided</th>
                <th className="py-3 px-4 text-center">Outcome</th>
                <th className="py-3 px-4 text-center">Post-Mortem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {data?.outcomes && data.outcomes.length > 0 ? (
                data.outcomes.map((outcome) => {
                  const statusCfg = OUTCOME_STATUS_CONFIG[outcome.finalStatus] || OUTCOME_STATUS_CONFIG.resolved_ontime;
                  const catCfg = DISRUPTION_CATEGORY_CONFIG[outcome.category];

                  return (
                    <tr key={outcome.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Incident & Material */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-[10px] text-slate-500 font-semibold">{outcome.incidentCode}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${catCfg.color} ${catCfg.bg}`}>
                            {catCfg.label}
                          </span>
                        </div>
                        <p className="font-semibold text-text-primary leading-tight line-clamp-1">{outcome.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Material: {outcome.affectedMaterial}</p>
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-4">
                        <Link href={`/onchain-insights/suppliers/${outcome.primarySupplierId}`} className="font-medium text-slate-800 hover:text-brand-primary hover:underline">
                          {outcome.primarySupplierName}
                        </Link>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{outcome.incidentDate}</span>
                      </td>

                      {/* Decision */}
                      <td className="py-3 px-4 max-w-sm">
                        <p className="text-slate-700 line-clamp-2 leading-relaxed">{outcome.decisionTaken}</p>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Approved: <strong className="text-slate-700">{outcome.decisionApprovedBy}</strong>
                        </span>
                      </td>

                      {/* Recovery Duration vs SLA */}
                      <td className="py-3 px-4 text-center">
                        <div className="font-bold text-slate-800">
                          {outcome.recoveryDurationDays} Days
                        </div>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium mt-0.5 ${
                            outcome.slaAdherence
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          Target: {outcome.targetSlaDays}d {outcome.slaAdherence ? '✓ Met' : '✗ Missed'}
                        </span>
                      </td>

                      {/* Cost vs Avoided */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-medium text-slate-600">
                          Spent: ₹{outcome.mitigationCostINR.toLocaleString('en-IN')}
                        </div>
                        <div className="font-bold text-emerald-700 mt-0.5">
                          Saved: ₹{outcome.penaltiesAvoidedINR.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-purple-700 font-semibold block">
                          Net: +₹{outcome.netBenefitINR.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Outcome Status */}
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Post-Mortem Action */}
                      <td className="py-3 px-4 text-center">
                        {outcome.postMortemConducted ? (
                          <button
                            onClick={() => {
                              const pm = data.postMortems.find((p) => p.outcomeId === outcome.id || p.id === outcome.postMortemId);
                              if (pm) setViewingPostMortem(pm);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md font-medium text-xs hover:bg-indigo-100 transition-colors"
                          >
                            <FileText size={12} />
                            View Review
                          </button>
                        ) : (
                          <button
                            onClick={() => openConductModal(outcome)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-dashed border-brand-primary text-brand-primary rounded-md font-medium text-xs hover:bg-brand-50 transition-colors"
                          >
                            <Plus size={12} />
                            Conduct
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <AlertTriangle size={28} className="mx-auto text-amber-500 mb-2" />
                    <p className="font-semibold text-slate-700">No matching historical outcomes found</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search keywords, category, or status filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VIEW COMPLETED POST-MORTEM */}
      {viewingPostMortem && (
        <Modal
          isOpen={Boolean(viewingPostMortem)}
          onClose={() => setViewingPostMortem(null)}
          title={`Post-Mortem Review: ${viewingPostMortem.incidentTitle}`}
          size="4xl"
        >
          <div className="space-y-6 text-xs text-slate-700 p-2">
            {/* Meta Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-mono text-xs font-bold text-slate-900 block">{viewingPostMortem.id}</span>
                <span className="text-slate-500">Conducted: {viewingPostMortem.conductedAt} by <strong>{viewingPostMortem.facilitator}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">
                  Root Cause: {viewingPostMortem.rootCauseCategory.replace('_', ' ').toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Status: COMPLETED
                </span>
              </div>
            </div>

            {/* Participants */}
            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-500 block mb-1">Participants</span>
              <div className="flex flex-wrap gap-1.5">
                {viewingPostMortem.participants.map((person, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700 font-medium">
                    {person}
                  </span>
                ))}
              </div>
            </div>

            {/* Root Cause Summary */}
            <div className="p-3.5 rounded-lg bg-rose-50/70 border border-rose-200">
              <span className="text-xs font-bold text-rose-900 block mb-1">Root Cause Summary</span>
              <p className="text-xs text-rose-800 leading-relaxed">{viewingPostMortem.rootCauseSummary}</p>
            </div>

            {/* 5 Whys Analysis Cascade */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 block">5 Whys Root-Cause Drilldown</span>
              <div className="space-y-1.5 border-l-2 border-indigo-400 pl-3">
                {[
                  { level: 'Why 1', text: viewingPostMortem.fiveWhys.why1 },
                  { level: 'Why 2', text: viewingPostMortem.fiveWhys.why2 },
                  { level: 'Why 3', text: viewingPostMortem.fiveWhys.why3 },
                  { level: 'Why 4', text: viewingPostMortem.fiveWhys.why4 },
                  { level: 'Why 5', text: viewingPostMortem.fiveWhys.why5 },
                ].map((step, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200">
                    <strong className="text-indigo-700 mr-2 font-mono">{step.level}:</strong>
                    <span className="text-slate-800">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What Went Well / What Went Wrong */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 block mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  What Went Well
                </span>
                <ul className="list-disc list-inside space-y-1 text-emerald-800">
                  {viewingPostMortem.whatWentWell.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-xs font-bold text-amber-900 block mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-600" />
                  What Went Wrong / Gaps
                </span>
                <ul className="list-disc list-inside space-y-1 text-amber-800">
                  {viewingPostMortem.whatWentWrong.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Items */}
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-2">Preventive Action Items</span>
              <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 font-semibold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2">Action</th>
                    <th className="p-2">Owner</th>
                    <th className="p-2">Due Date</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {viewingPostMortem.actionItems.map((act) => (
                    <tr key={act.id}>
                      <td className="p-2 font-medium text-slate-800">{act.action}</td>
                      <td className="p-2 text-slate-600">{act.owner}</td>
                      <td className="p-2 text-slate-600">{act.dueDate}</td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            act.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : act.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Preventive Policy Statement */}
            <div className="p-3.5 rounded-lg bg-indigo-50 border border-indigo-200">
              <span className="text-xs font-bold text-indigo-900 block mb-1">Adopted Corporate SCM Policy</span>
              <p className="text-xs text-indigo-800 leading-relaxed font-mono">
                {viewingPostMortem.preventivePolicy}
              </p>
            </div>

            {/* Close button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingPostMortem(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
              >
                Close Retrospective
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: CONDUCT NEW POST-MORTEM */}
      {conductingForOutcome && (
        <Modal
          isOpen={Boolean(conductingForOutcome)}
          onClose={() => setConductingForOutcome(null)}
          title={`Conduct Post-Mortem: ${conductingForOutcome.title}`}
          size="4xl"
        >
          <form onSubmit={handlePostMortemSubmit} className="space-y-4 text-xs text-slate-700 p-2">
            {/* Header Context */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900">{conductingForOutcome.incidentCode} • {conductingForOutcome.affectedMaterial}</span>
                <span className="text-slate-500 block">Supplier: {conductingForOutcome.primarySupplierName} • Recovery: {conductingForOutcome.recoveryDurationDays} Days</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[11px]">
                Drafting Continuous Improvement Log
              </span>
            </div>

            {/* Facilitator & Participants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Review Facilitator</label>
                <input
                  type="text"
                  value={pmFacilitator}
                  onChange={(e) => setPmFacilitator(e.target.value)}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Participants (Comma-separated)</label>
                <input
                  type="text"
                  value={pmParticipants}
                  onChange={(e) => setPmParticipants(e.target.value)}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            </div>

            {/* Root Cause Category & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Primary Root Cause Category</label>
                <select
                  value={pmRootCategory}
                  onChange={(e) => setPmRootCategory(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="single_source_failure">Single Source Failure</option>
                  <option value="supplier_capacity">Supplier Capacity Deficit</option>
                  <option value="geopolitical_port">Port / Customs Congestion</option>
                  <option value="quality_defect">Raw Material Quality Defect</option>
                  <option value="demand_spike">Unforecasted Demand Spike</option>
                  <option value="weather_force_majeure">Weather / Force Majeure</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Root Cause Summary Statement</label>
                <input
                  type="text"
                  value={pmSummary}
                  onChange={(e) => setPmSummary(e.target.value)}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            </div>

            {/* 5 Whys Analysis Form */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">5-Whys Root Cause Chain</span>
                <span className="text-[10px] text-slate-500">Structured drill-down to root systemic policy</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Why 1 (Immediate symptom)', val: pmWhy1, set: setPmWhy1 },
                  { label: 'Why 2 (Direct cause)', val: pmWhy2, set: setPmWhy2 },
                  { label: 'Why 3 (Process / buffer gap)', val: pmWhy3, set: setPmWhy3 },
                  { label: 'Why 4 (Policy or governance gap)', val: pmWhy4, set: setPmWhy4 },
                  { label: 'Why 5 (Root systemic driver)', val: pmWhy5, set: setPmWhy5 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-24 text-[10px] font-bold text-indigo-700 shrink-0">{item.label}:</span>
                    <input
                      type="text"
                      value={item.val}
                      onChange={(e) => item.set(e.target.value)}
                      required
                      className="flex-1 p-1.5 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* What Went Well & What Went Wrong */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-emerald-800 mb-1">What Went Well (Positive responses)</label>
                <textarea
                  rows={2}
                  value={pmWentWell}
                  onChange={(e) => setPmWentWell(e.target.value)}
                  className="w-full p-2 border border-emerald-300 rounded-lg text-xs bg-emerald-50/40"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-rose-800 mb-1">What Went Wrong / Key Bottlenecks</label>
                <textarea
                  rows={2}
                  value={pmWentWrong}
                  onChange={(e) => setPmWentWrong(e.target.value)}
                  className="w-full p-2 border border-rose-300 rounded-lg text-xs bg-rose-50/40"
                />
              </div>
            </div>

            {/* Action Item & Policy */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Preventative Action Item</label>
                <input
                  type="text"
                  value={pmActionItem.action}
                  onChange={(e) => setPmActionItem({ ...pmActionItem, action: e.target.value })}
                  placeholder="e.g. Mandate secondary supplier qualification for this SKU"
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Owner & Target Date</label>
                <input
                  type="text"
                  value={pmActionItem.owner}
                  onChange={(e) => setPmActionItem({ ...pmActionItem, owner: e.target.value })}
                  placeholder="Responsible Person"
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Preventive Corporate Policy Directive</label>
              <textarea
                rows={2}
                value={pmPolicy}
                onChange={(e) => setPmPolicy(e.target.value)}
                placeholder="Formal protocol wording to be appended to company standard operating procedures"
                required
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setConductingForOutcome(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitPostMortemMutation.isPending}
                className="px-5 py-2 bg-brand-primary text-white rounded-lg text-xs font-semibold hover:bg-brand-hover flex items-center gap-2 shadow"
              >
                {submitPostMortemMutation.isPending ? 'Saving...' : 'Submit & Archive Post-Mortem'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
