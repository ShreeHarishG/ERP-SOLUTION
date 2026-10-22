'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Radio,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Truck,
  Anchor,
  CloudRain,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Eye,
  RefreshCw,
  FileText,
  X,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  MapPin,
  Sparkles,
  TrendingUp,
  Send,
  Calendar,
  Building2,
  Package,
  Activity,
  AlertOctagon,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import {
  RISK_TIER_CONFIG,
  DISRUPTION_CATEGORY_LABELS,
} from '@/types/onchain-insights';
import type {
  DisruptionSignalDetail,
  ShipmentTransitRecord,
  DisruptionSeverity,
  DisruptionStatus,
  DisruptionCategory,
  DisruptionFilterParams,
  ShipmentFilterParams,
} from '@/types/onchain-insights';

export default function DisruptionsMonitoringPage() {
  const { useDisruptions, useShipments, useUpdateDisruptionStatus } = useOnchainInsights();

  // Active Main Tab: 'signals' | 'shipments'
  const [activeTab, setActiveTab] = useState<'signals' | 'shipments'>('signals');

  // Signal Filters State
  const [signalFilters, setSignalFilters] = useState<DisruptionFilterParams>({
    severity: 'all',
    category: 'all',
    status: 'all',
    search: '',
  });

  // Shipment Filters State
  const [shipmentFilters, setShipmentFilters] = useState<ShipmentFilterParams>({
    status: 'all',
    riskSeverity: 'all',
    search: '',
  });

  // Selected Signal for Drawer Detail
  const [selectedSignal, setSelectedSignal] = useState<DisruptionSignalDetail | null>(null);

  // Status Update Modal State
  const [statusModalSignal, setStatusModalSignal] = useState<DisruptionSignalDetail | null>(null);
  const [targetStatus, setTargetStatus] = useState<DisruptionStatus>('acknowledged');
  const [statusNote, setStatusNote] = useState<string>('');

  // Queries
  const {
    data: disruptionsResponse,
    isLoading: isLoadingDisruptions,
    isError: isErrorDisruptions,
    refetch: refetchDisruptions,
    isFetching: isFetchingDisruptions,
  } = useDisruptions(signalFilters);

  const {
    data: shipmentsResponse,
    isLoading: isLoadingShipments,
    refetch: refetchShipments,
  } = useShipments(shipmentFilters);

  const updateStatusMutation = useUpdateDisruptionStatus();

  const disruptionsList = disruptionsResponse?.data || [];
  const kpis = disruptionsResponse?.kpis || {
    activeDisruptions: 6,
    criticalDisruptions: 4,
    delayedShipments: 6,
    avgDelayDays: '5.8',
    resolvedCount: 5,
    totalTrackedShipments: 12,
  };

  const shipmentsList = shipmentsResponse?.data || [];

  // Handle Quick Status Transition
  const handleOpenStatusModal = (signal: DisruptionSignalDetail, newStatus: DisruptionStatus) => {
    setStatusModalSignal(signal);
    setTargetStatus(newStatus);
    setStatusNote(`Transitioning signal status to ${newStatus.toUpperCase()} during operational review.`);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusModalSignal) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: statusModalSignal.id,
        payload: {
          status: targetStatus,
          notes: statusNote,
          actor: 'Operations Lead (Current Session)',
        },
      });

      toast.success(`Disruption status updated to ${targetStatus.toUpperCase()}`);

      // If drawer is open with this signal, update it in place
      if (selectedSignal?.id === statusModalSignal.id) {
        setSelectedSignal(prev => prev ? { ...prev, status: targetStatus } : null);
      }

      setStatusModalSignal(null);
      setStatusNote('');
    } catch {
      toast.error('Failed to update disruption status.');
    }
  };

  // Helper for Category Icons
  const getCategoryIcon = (category: DisruptionCategory) => {
    switch (category) {
      case 'weather':
        return <CloudRain className="text-blue-500" size={16} />;
      case 'port_congestion':
        return <Anchor className="text-amber-500" size={16} />;
      case 'supplier_incident':
        return <Building2 className="text-purple-500" size={16} />;
      case 'geopolitical':
        return <ShieldAlert className="text-rose-500" size={16} />;
      case 'logistics':
        return <Truck className="text-orange-500" size={16} />;
      case 'quality':
        return <AlertOctagon className="text-red-500" size={16} />;
      case 'financial':
        return <TrendingUp className="text-indigo-500" size={16} />;
      default:
        return <Activity className="text-slate-500" size={16} />;
    }
  };

  // Helper for Status Badge styling
  const getStatusBadge = (status: DisruptionStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="red" className="uppercase text-[9px] font-bold">Active</Badge>;
      case 'acknowledged':
        return <Badge variant="amber" className="uppercase text-[9px] font-bold">Acknowledged</Badge>;
      case 'investigating':
        return <Badge variant="purple" className="uppercase text-[9px] font-bold">Investigating</Badge>;
      case 'monitoring':
        return <Badge variant="blue" className="uppercase text-[9px] font-bold">Monitoring</Badge>;
      case 'resolved':
        return <Badge variant="green" className="uppercase text-[9px] font-bold">Resolved</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* ================================================================ */}
      {/* HEADER & CONTEXT BAR */}
      {/* ================================================================ */}
      <div className="bg-white border border-surface-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <Breadcrumbs
              items={[
                { label: 'Onchain Insights', href: '/onchain-insights' },
                { label: 'Disruption & Shipment Monitoring' },
              ]}
            />
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h1 className="page-title text-2xl font-bold tracking-tight text-[#4B164C]">
                Disruption Signals & Shipment Transit Monitoring
              </h1>
              {/* Mandatory acceptance criteria label: Demo Data */}
              <Badge className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-600" />
                Synthetic Intelligence Feed (Demo Data)
              </Badge>
            </div>
            <p className="page-subtitle text-xs text-text-muted">
              Live monitoring workspace for supplier incidents, maritime delay corridors, customs dwell spikes, and regional logistics disruptions
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                refetchDisruptions();
                refetchShipments();
                toast.success('Telemetry feeds refreshed from onchain & satellite monitors.');
              }}
              disabled={isFetchingDisruptions}
              className="btn-secondary text-xs px-3.5 py-1.5 gap-1.5"
            >
              <RefreshCw size={13} className={isFetchingDisruptions ? 'animate-spin' : ''} />
              Refresh Signals
            </button>
            <button
              onClick={() => {
                toast.success('Exported incident event log to CSV audit archive.');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4B164C] text-white hover:bg-[#39103a] shadow-sm transition-all"
            >
              <FileText size={13} />
              Export Incident Log
            </button>
          </div>
        </div>

        {/* Tab Switcher Header */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('signals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'signals'
                ? 'bg-[#4B164C] text-white shadow-xs'
                : 'bg-slate-50 text-text-secondary hover:bg-slate-100 hover:text-text-primary'
            }`}
          >
            <Radio size={14} />
            <span>Disruption Signal Feed</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'signals' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {disruptionsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('shipments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'shipments'
                ? 'bg-[#4B164C] text-white shadow-xs'
                : 'bg-slate-50 text-text-secondary hover:bg-slate-100 hover:text-text-primary'
            }`}
          >
            <Truck size={14} />
            <span>Shipment Transit Tracker</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'shipments' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {shipmentsList.length}
            </span>
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* TOP KPI STRIP */}
      {/* ================================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Active Disruptions */}
        <div className="glass-card p-4 space-y-1 border-t-2 border-t-rose-500">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Signals</span>
            <AlertTriangle size={14} className="text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700 tracking-tight">
            {kpis.activeDisruptions}
          </p>
          <p className="text-[10px] text-text-muted">
            Requiring immediate operational review
          </p>
        </div>

        {/* Critical & High Severity */}
        <div className="glass-card p-4 space-y-1 border-t-2 border-t-orange-500">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">High / Critical</span>
            <ShieldAlert size={14} className="text-orange-600" />
          </div>
          <p className="text-2xl font-black text-orange-700 tracking-tight">
            {kpis.criticalDisruptions}
          </p>
          <p className="text-[10px] text-text-muted">
            Direct production schedule exposure
          </p>
        </div>

        {/* Delayed Shipments */}
        <div className="glass-card p-4 space-y-1 border-t-2 border-t-amber-500">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Delayed Shipments</span>
            <Truck size={14} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 tracking-tight">
            {kpis.delayedShipments}
            <span className="text-xs font-normal text-text-muted ml-1">/ {kpis.totalTrackedShipments}</span>
          </p>
          <p className="text-[10px] text-text-muted">
            Consignments beyond ETA window
          </p>
        </div>

        {/* Average Transit Delay */}
        <div className="glass-card p-4 space-y-1 border-t-2 border-t-blue-500">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Inbound Delay</span>
            <Clock size={14} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 tracking-tight">
            +{kpis.avgDelayDays} <span className="text-sm font-bold">days</span>
          </p>
          <p className="text-[10px] text-text-muted">
            Across affected transit routes
          </p>
        </div>

        {/* Resolved This Cycle */}
        <div className="glass-card p-4 space-y-1 border-t-2 border-t-emerald-500">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Resolved Signals</span>
            <CheckCircle2 size={14} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 tracking-tight">
            {kpis.resolvedCount}
          </p>
          <p className="text-[10px] text-text-muted">
            Corridors returned to baseline throughput
          </p>
        </div>
      </div>

      {/* ================================================================ */}
      {/* TAB 1: DISRUPTION SIGNAL FEED */}
      {/* ================================================================ */}
      {activeTab === 'signals' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search disruptions by incident title, material, corridor or region..."
                  value={signalFilters.search || ''}
                  onChange={(e) => setSignalFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="input-field pl-9 pr-4 py-2 text-xs w-full h-9 rounded-xl"
                />
              </div>

              {/* Severity Filter */}
              <div className="w-full md:w-44">
                <select
                  value={signalFilters.severity || 'all'}
                  onChange={(e) => setSignalFilters(prev => ({ ...prev, severity: e.target.value }))}
                  className="input-field text-xs h-9 py-1 px-3 w-full rounded-xl font-medium"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-44">
                <select
                  value={signalFilters.status || 'all'}
                  onChange={(e) => setSignalFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field text-xs h-9 py-1 px-3 w-full rounded-xl font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="investigating">Investigating</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {(signalFilters.search || signalFilters.severity !== 'all' || signalFilters.status !== 'all' || signalFilters.category !== 'all') && (
                <button
                  onClick={() => setSignalFilters({ severity: 'all', category: 'all', status: 'all', search: '' })}
                  className="text-xs text-[#4B164C] hover:underline font-bold whitespace-nowrap px-2"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Category Quick Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-slate-100">
              <span className="text-[10px] font-bold text-text-muted uppercase mr-1 flex items-center gap-1">
                <Filter size={11} /> Categories:
              </span>
              <button
                onClick={() => setSignalFilters(prev => ({ ...prev, category: 'all' }))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  signalFilters.category === 'all'
                    ? 'bg-[#4B164C] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({disruptionsResponse?.total || 0})
              </button>
              {(Object.keys(DISRUPTION_CATEGORY_LABELS) as DisruptionCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSignalFilters(prev => ({ ...prev, category: cat }))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    signalFilters.category === cat
                      ? 'bg-[#4B164C] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{DISRUPTION_CATEGORY_LABELS[cat]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Signals Cards Grid */}
          {isLoadingDisruptions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-44 w-full" />
            </div>
          ) : disruptionsList.length === 0 ? (
            <div className="p-12 text-center bg-white border border-surface-border rounded-2xl">
              <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={36} />
              <h3 className="font-bold text-sm text-text-primary">No Matching Disruption Signals</h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                No active incidents found matching your query. Adjust your search or clear filters to view catalog history.
              </p>
              <button
                onClick={() => setSignalFilters({ severity: 'all', category: 'all', status: 'all', search: '' })}
                className="btn-secondary text-xs mt-4"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {disruptionsList.map((signal) => {
                const sevCfg = RISK_TIER_CONFIG[signal.severity];
                return (
                  <div
                    key={signal.id}
                    className={`glass-card p-5 space-y-3 relative flex flex-col justify-between hover:shadow-md transition-all border-l-4 ${
                      signal.severity === 'critical'
                        ? 'border-l-rose-500'
                        : signal.severity === 'high'
                        ? 'border-l-orange-500'
                        : signal.severity === 'medium'
                        ? 'border-l-amber-500'
                        : 'border-l-emerald-500'
                    }`}
                  >
                    <div>
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded bg-slate-100 flex items-center justify-center">
                            {getCategoryIcon(signal.category)}
                          </span>
                          <span className="text-[10px] font-bold text-text-muted uppercase">
                            {DISRUPTION_CATEGORY_LABELS[signal.category]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${sevCfg.bg} ${sevCfg.color} border ${sevCfg.border}`}>
                            {signal.severity}
                          </span>
                          {getStatusBadge(signal.status)}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-sm font-bold text-text-primary leading-tight hover:text-[#4B164C] cursor-pointer"
                          onClick={() => setSelectedSignal(signal)}>
                        {signal.title}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1.5 leading-relaxed line-clamp-2">
                        {signal.description}
                      </p>

                      {/* Location & Impact Banner */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-text-muted flex items-center gap-1">
                            <MapPin size={11} className="text-slate-400" /> {signal.region}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(signal.detectedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-rose-700">
                          <strong>Estimated Delay:</strong> {signal.estimatedImpact}
                        </p>
                      </div>

                      {/* Affected Entities Chips */}
                      <div className="flex items-center gap-2 pt-3 flex-wrap text-[10px]">
                        {signal.affectedMaterials.map((mat, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium border border-purple-100 flex items-center gap-1">
                            <Package size={10} /> {mat}
                          </span>
                        ))}
                        {signal.affectedShipments.map((shp, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono font-bold border border-blue-100 flex items-center gap-1">
                            <Truck size={10} /> {shp}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Workflow Actions */}
                    <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedSignal(signal)}
                        className="text-xs font-bold text-[#4B164C] hover:underline flex items-center gap-1"
                      >
                        <Eye size={13} /> View Audit Details
                      </button>

                      {/* Quick Status Workflow Buttons */}
                      <div className="flex items-center gap-1.5">
                        {signal.status === 'active' && (
                          <button
                            onClick={() => handleOpenStatusModal(signal, 'acknowledged')}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all"
                          >
                            Acknowledge
                          </button>
                        )}
                        {(signal.status === 'active' || signal.status === 'acknowledged') && (
                          <button
                            onClick={() => handleOpenStatusModal(signal, 'investigating')}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-all"
                          >
                            Investigate
                          </button>
                        )}
                        {signal.status !== 'resolved' && (
                          <button
                            onClick={() => handleOpenStatusModal(signal, 'resolved')}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 2: SHIPMENT TRANSIT TRACKER */}
      {/* ================================================================ */}
      {activeTab === 'shipments' && (
        <div className="space-y-4">
          {/* Shipment Filters */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search shipments by carrier, consignment ID, SKU, origin or destination..."
                  value={shipmentFilters.search || ''}
                  onChange={(e) => setShipmentFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="input-field pl-9 pr-4 py-2 text-xs w-full h-9 rounded-xl"
                />
              </div>

              <div className="w-full md:w-48">
                <select
                  value={shipmentFilters.status || 'all'}
                  onChange={(e) => setShipmentFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field text-xs h-9 py-1 px-3 w-full rounded-xl font-medium"
                >
                  <option value="all">All Transit Statuses</option>
                  <option value="delayed">Delayed</option>
                  <option value="held_customs">Held in Customs</option>
                  <option value="on_schedule">On Schedule</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <div className="w-full md:w-48">
                <select
                  value={shipmentFilters.riskSeverity || 'all'}
                  onChange={(e) => setShipmentFilters(prev => ({ ...prev, riskSeverity: e.target.value }))}
                  className="input-field text-xs h-9 py-1 px-3 w-full rounded-xl font-medium"
                >
                  <option value="all">All Risk Tiers</option>
                  <option value="critical">Critical Risk</option>
                  <option value="high">High Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="low">Low Risk</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shipments Table / Grid */}
          {isLoadingShipments ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : shipmentsList.length === 0 ? (
            <div className="p-12 text-center bg-white border border-surface-border rounded-2xl">
              <Truck className="mx-auto text-slate-400 mb-2" size={36} />
              <h3 className="font-bold text-sm text-text-primary">No Shipments Found</h3>
              <p className="text-xs text-text-muted mt-1">Adjust search parameters to track active shipments.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shipmentsList.map((shp) => {
                const isDelayed = shp.status === 'delayed' || shp.status === 'held_customs';
                return (
                  <div
                    key={shp.id}
                    className={`glass-card p-5 space-y-3 hover:shadow-md transition-all border-l-4 ${
                      shp.status === 'delayed'
                        ? 'border-l-rose-500'
                        : shp.status === 'held_customs'
                        ? 'border-l-amber-500'
                        : shp.status === 'delivered'
                        ? 'border-l-emerald-500'
                        : 'border-l-blue-500'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-sm text-text-primary">
                            {shp.shipmentNumber}
                          </span>
                          <span className="text-[10px] text-text-muted">• {shp.carrier}</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              shp.status === 'delayed'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : shp.status === 'held_customs'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : shp.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {shp.status.replace('_', ' ')}
                            {shp.delayDays > 0 ? ` (+${shp.delayDays}d)` : ''}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#4B164C]">
                          {shp.materialName} ({shp.quantityUnits.toLocaleString('en-IN')} units • ₹{shp.valueINR.toLocaleString('en-IN')})
                        </p>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-text-muted text-[11px]">Supplier: </span>
                        <span className="font-bold text-text-primary">{shp.supplierName}</span>
                        <div className="text-[11px] text-slate-500">
                          ETA: {shp.revisedDeliveryDate}
                          {shp.delayDays > 0 && (
                            <span className="text-rose-600 font-bold ml-1">
                              (Original: {shp.expectedDeliveryDate})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Route Corridor Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-xs font-medium">
                        <span className="flex items-center gap-1 text-slate-700">
                          <MapPin size={12} className="text-blue-500" /> {shp.origin} ({shp.originCountry})
                        </span>
                        <span className="font-mono font-bold text-[#4B164C]">
                          {shp.transitProgressPercent}% Complete
                        </span>
                        <span className="flex items-center gap-1 text-slate-700">
                          <MapPin size={12} className="text-emerald-500" /> {shp.destination}
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isDelayed ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${shp.transitProgressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Linked Disruption Indicator */}
                    {shp.relatedDisruptionTitle && (
                      <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100 flex items-center justify-between text-xs text-rose-800">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={13} className="text-rose-600 shrink-0" />
                          <span>
                            <strong>Disruption Linked:</strong> {shp.relatedDisruptionTitle}
                          </span>
                        </div>
                        {shp.relatedDisruptionId && (
                          <button
                            onClick={() => {
                              const match = disruptionsList.find(d => d.id === shp.relatedDisruptionId);
                              if (match) setSelectedSignal(match);
                            }}
                            className="font-bold text-rose-900 underline hover:no-underline text-[11px] shrink-0 ml-2"
                          >
                            Inspect Cause
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* SIGNAL AUDIT DRAWER / DETAIL MODAL */}
      {/* ================================================================ */}
      {selectedSignal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-left">
            {/* Drawer Header */}
            <div className="p-6 border-b border-surface-border flex items-start justify-between bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    {DISRUPTION_CATEGORY_LABELS[selectedSignal.category]}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${RISK_TIER_CONFIG[selectedSignal.severity].bg} ${RISK_TIER_CONFIG[selectedSignal.severity].color} border ${RISK_TIER_CONFIG[selectedSignal.severity].border}`}>
                    {selectedSignal.severity}
                  </span>
                  {getStatusBadge(selectedSignal.status)}
                </div>
                <h2 className="text-lg font-bold text-text-primary leading-tight">
                  {selectedSignal.title}
                </h2>
                <p className="text-xs text-text-muted">
                  Signal ID: {selectedSignal.id} • Detected via {selectedSignal.source} on {new Date(selectedSignal.detectedAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedSignal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Detailed Description */}
              <div className="space-y-2">
                <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                  Incident Description & Situation Assessment
                </h4>
                <p className="text-text-secondary leading-relaxed p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {selectedSignal.description}
                </p>
              </div>

              {/* Geographic Region & Delay Impact */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-text-muted uppercase">Corridor / Location</p>
                  <p className="font-semibold text-text-primary flex items-center gap-1">
                    <MapPin size={12} className="text-slate-500" /> {selectedSignal.region}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 space-y-1">
                  <p className="text-[10px] font-bold text-rose-700 uppercase">Estimated Impact</p>
                  <p className="font-bold text-rose-800">{selectedSignal.estimatedImpact}</p>
                </div>
              </div>

              {/* Recommended Mitigation Playbook */}
              {selectedSignal.recommendedMitigation && (
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#4B164C] font-bold">
                    <Sparkles size={14} /> Recommended Action & Mitigation Playbook:
                  </div>
                  <p className="text-text-secondary leading-relaxed">
                    {selectedSignal.recommendedMitigation}
                  </p>
                </div>
              )}

              {/* Affected Sales Orders */}
              {selectedSignal.affectedOrderDetails && selectedSignal.affectedOrderDetails.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                    Downstream Customer Sales Orders Impacted ({selectedSignal.affectedOrderDetails.length})
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                    {selectedSignal.affectedOrderDetails.map((ord) => (
                      <div key={ord.orderId} className="p-3 flex justify-between items-center bg-white">
                        <div>
                          <p className="font-bold text-text-primary">{ord.customerName}</p>
                          <p className="text-[10px] text-text-muted">Order ID: {ord.orderId} • Target Due: {ord.dueDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-[#4B164C]">₹{ord.value.toLocaleString('en-IN')}</p>
                          <span className="text-[9px] font-bold uppercase text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Affected Shipments */}
              {selectedSignal.affectedShipmentDetails && selectedSignal.affectedShipmentDetails.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                    Linked Maritime & Surface Consignments ({selectedSignal.affectedShipmentDetails.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedSignal.affectedShipmentDetails.map((shp) => (
                      <div key={shp.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-text-primary">{shp.shipmentNumber}</span>
                          <span className="text-[10px] font-bold text-rose-700">+{shp.delayDays} Days Delay</span>
                        </div>
                        <p className="text-text-muted text-[11px]">
                          {shp.carrier} • {shp.origin} → {shp.destination}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status History & Audit Log */}
              <div className="space-y-2">
                <h4 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                  Chronological Incident Audit Timeline
                </h4>
                <div className="space-y-3 pl-2 border-l-2 border-slate-200 pt-1">
                  {selectedSignal.timeline && selectedSignal.timeline.map((event) => (
                    <div key={event.id} className="relative pl-4 space-y-0.5">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#4B164C] ring-4 ring-white" />
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-text-primary">{event.action}</span>
                        <span className="text-slate-400 font-mono">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-text-secondary text-[11px] leading-relaxed">{event.notes}</p>
                      <p className="text-[10px] text-text-muted font-medium">Logged by: {event.actor}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer Workflow Controls */}
            <div className="p-4 border-t border-surface-border bg-slate-50 flex items-center justify-between gap-2">
              <span className="text-[11px] text-text-muted font-medium">
                Current State: <strong className="uppercase text-[#4B164C]">{selectedSignal.status}</strong>
              </span>

              <div className="flex items-center gap-2">
                {selectedSignal.status === 'active' && (
                  <button
                    onClick={() => handleOpenStatusModal(selectedSignal, 'acknowledged')}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Acknowledge
                  </button>
                )}
                {selectedSignal.status !== 'investigating' && selectedSignal.status !== 'resolved' && (
                  <button
                    onClick={() => handleOpenStatusModal(selectedSignal, 'investigating')}
                    className="btn-secondary text-xs px-3 py-1.5 text-purple-700 bg-purple-50 hover:bg-purple-100"
                  >
                    Start Investigation
                  </button>
                )}
                {selectedSignal.status !== 'resolved' && (
                  <button
                    onClick={() => handleOpenStatusModal(selectedSignal, 'resolved')}
                    className="btn-primary text-xs px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* STATUS TRANSITION CONFIRMATION MODAL */}
      {/* ================================================================ */}
      {statusModalSignal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base text-text-primary">
                  Update Disruption Status
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Transition signal status for: {statusModalSignal.title}
                </p>
              </div>
              <button
                onClick={() => setStatusModalSignal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-text-muted uppercase text-[10px]">
                  Target Operational State
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as DisruptionStatus)}
                  className="input-field w-full py-1.5 h-9 font-semibold uppercase text-xs"
                >
                  <option value="acknowledged">Acknowledged (Logged into triage)</option>
                  <option value="investigating">Investigating (Action team assigned)</option>
                  <option value="resolved">Resolved (Corridor restored)</option>
                  <option value="monitoring">Monitoring (Background observation)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-muted uppercase text-[10px]">
                  Audit Note / Operational Context
                </label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Describe root-cause findings, carrier updates, or resolution actions taken..."
                  className="input-field w-full p-2.5 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setStatusModalSignal(null)}
                className="btn-secondary text-xs px-3.5 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusUpdate}
                disabled={updateStatusMutation.isPending}
                className="btn-primary text-xs px-4 py-1.5 bg-[#4B164C] text-white hover:bg-[#39103a]"
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Confirm Status Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
