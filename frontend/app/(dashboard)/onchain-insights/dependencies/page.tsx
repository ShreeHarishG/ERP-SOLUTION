'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  MarkerType,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Network,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Filter,
  Eye,
  RefreshCw,
  ExternalLink,
  MapPin,
  Sparkles,
  Search,
  Building2,
  Package,
  ShoppingCart,
  Warehouse,
  Factory,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
  X,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import { traceDownstreamImpact } from '@/lib/mock-data/onchain-insights/dependencies';
import type {
  DependencyNodeType,
  DependencyNodeData,
  DownstreamImpactSummary,
} from '@/types/onchain-insights';

// -----------------------------------------------------------------------------
// CUSTOM REACT FLOW NODE COMPONENT
// -----------------------------------------------------------------------------
function DependencyCustomNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as DependencyNodeData;

  const typeConfig: Record<DependencyNodeType, { label: string; bg: string; text: string; border: string; icon: any }> = {
    sub_tier:  { label: 'Sub-Tier Extractor', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: Factory },
    supplier:  { label: 'Tier-1 Supplier',    bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', icon: Building2 },
    material:  { label: 'Raw Material / BOM', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', icon: Package },
    facility:  { label: 'Facility / Plant',   bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: Warehouse },
    product:   { label: 'Finished SKU',       bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', icon: Layers },
    order:     { label: 'Customer Order',     bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', icon: ShoppingCart },
  };

  const cfg = typeConfig[nodeData.type] || typeConfig.material;
  const Icon = cfg.icon;

  const isDisrupted = nodeData.status === 'disrupted' || nodeData.status === 'delayed';
  const isAtRisk = nodeData.status === 'at_risk';

  return (
    <div
      className={`relative px-3.5 py-3 rounded-2xl bg-white shadow-md border-2 transition-all w-60 text-left select-none ${
        nodeData.isRootSource
          ? 'border-[#4B164C] ring-4 ring-[#4B164C]/20 shadow-xl scale-105'
          : nodeData.isImpacted
          ? 'border-rose-500 ring-2 ring-rose-400/30 shadow-lg'
          : selected
          ? 'border-blue-600 ring-2 ring-blue-500/20'
          : 'border-slate-200 hover:border-slate-400'
      }`}
    >
      {/* Target input handle on left */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white"
      />

      {/* Top Tag & Status */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${cfg.bg} ${cfg.text}`}>
          <Icon size={10} />
          {cfg.label}
        </span>

        {isDisrupted ? (
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" title="Disrupted" />
        ) : isAtRisk ? (
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" title="At Risk" />
        ) : (
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Operational" />
        )}
      </div>

      {/* Label & Sublabel */}
      <h4 className="font-bold text-xs text-text-primary leading-tight line-clamp-1">
        {nodeData.label}
      </h4>
      <p className="text-[10px] text-text-secondary mt-0.5 font-mono line-clamp-1">
        {nodeData.sublabel}
      </p>

      {/* Disruption Warning Tag */}
      {nodeData.disruptionTitle && (
        <div className="mt-2 p-1.5 rounded-lg bg-rose-50 border border-rose-100 flex items-center gap-1 text-[9px] font-bold text-rose-800 line-clamp-1">
          <AlertTriangle size={10} className="shrink-0 text-rose-600" />
          <span className="truncate">{nodeData.disruptionTitle}</span>
        </div>
      )}

      {/* Footer Info (Value or Units) */}
      {nodeData.valueINR ? (
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex justify-between items-center text-[10px]">
          <span className="text-text-muted">Order Value:</span>
          <span className="font-bold text-[#4B164C] font-mono">₹{nodeData.valueINR.toLocaleString('en-IN')}</span>
        </div>
      ) : nodeData.stockUnits ? (
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex justify-between items-center text-[10px]">
          <span className="text-text-muted">Ledger Stock:</span>
          <span className="font-bold text-text-primary font-mono">{nodeData.stockUnits.toLocaleString('en-IN')} units</span>
        </div>
      ) : null}

      {/* Source output handle on right */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white"
      />
    </div>
  );
}

const nodeTypes = {
  default: DependencyCustomNode,
};

// -----------------------------------------------------------------------------
// MAIN PAGE COMPONENT
// -----------------------------------------------------------------------------
export default function DependencyExplorerPage() {
  const { useDependencyGraph } = useOnchainInsights();

  // Selected Node ID State
  const [selectedNodeId, setSelectedNodeId] = useState<string>('sup-001');

  // Search & Type Filter State
  const [activeTypeFilters, setActiveTypeFilters] = useState<Record<DependencyNodeType, boolean>>({
    sub_tier: true,
    supplier: true,
    material: true,
    facility: true,
    product: true,
    order: true,
  });

  const [onlyDisruptedFilter, setOnlyDisruptedFilter] = useState<boolean>(false);

  // Fetch full graph from API
  const { data: graphResponse, isLoading, isError, refetch } = useDependencyGraph(selectedNodeId);

  const rawNodes = graphResponse?.data?.nodes || [];
  const rawEdges = graphResponse?.data?.edges || [];

  // Compute downstream impact path for selected node
  const impactSummary: DownstreamImpactSummary = useMemo(() => {
    return traceDownstreamImpact(selectedNodeId);
  }, [selectedNodeId]);

  // Selected node object
  const selectedNode = useMemo(() => {
    return rawNodes.find(n => n.id === selectedNodeId) || rawNodes[0];
  }, [rawNodes, selectedNodeId]);

  // Toggle type filter
  const toggleTypeFilter = (type: DependencyNodeType) => {
    setActiveTypeFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Filtered and styled nodes
  const nodes = useMemo(() => {
    return rawNodes
      .filter((n) => {
        // Type filter
        if (!activeTypeFilters[n.data.type]) return false;
        // Only disrupted filter
        if (onlyDisruptedFilter) {
          return n.data.status === 'disrupted' || n.data.status === 'delayed' || n.data.status === 'at_risk';
        }
        return true;
      })
      .map((n) => {
        const isRoot = n.id === selectedNodeId;
        const isImpacted = impactSummary.pathNodeIds.includes(n.id);
        const hasSelection = Boolean(selectedNodeId);

        return {
          ...n,
          data: {
            ...n.data,
            isRootSource: isRoot,
            isImpacted: isImpacted,
          },
          style: {
            opacity: hasSelection ? (isImpacted ? 1 : 0.28) : 1,
            transition: 'opacity 0.2s ease',
          },
        };
      });
  }, [rawNodes, activeTypeFilters, onlyDisruptedFilter, selectedNodeId, impactSummary]);

  // Filtered and styled edges
  const edges = useMemo(() => {
    const visibleNodeIds = new Set(nodes.map(n => n.id));

    return rawEdges
      .filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
      .map((e) => {
        const isImpactedEdge = impactSummary.pathEdgeIds.includes(e.id);
        const hasSelection = Boolean(selectedNodeId);

        return {
          ...e,
          animated: isImpactedEdge,
          style: {
            stroke: isImpactedEdge ? '#e11d48' : '#94a3b8',
            strokeWidth: isImpactedEdge ? 2.5 : 1.2,
            opacity: hasSelection ? (isImpactedEdge ? 1 : 0.15) : 0.6,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isImpactedEdge ? '#e11d48' : '#94a3b8',
          },
        };
      });
  }, [rawEdges, nodes, selectedNodeId, impactSummary]);

  // Handle node click event
  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNodeId(node.id);
    toast.success(`Tracing downstream impact from: ${node.data.label}`);
  }, []);

  // Quick Preset Handlers
  const applyPreset = (nodeId: string, label: string) => {
    setSelectedNodeId(nodeId);
    toast.success(`Loaded scenario: ${label}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (isError || !graphResponse) {
    return (
      <div className="p-12 text-center border border-rose-200 bg-rose-50/50 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
        <h3 className="font-bold text-base text-rose-800">Dependency Graph Error</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">
          Could not load multi-tier supply chain network topology.
        </p>
        <button onClick={() => refetch()} className="btn-primary bg-rose-600 hover:bg-rose-700">
          Retry Graph
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6 animate-slide-up">
      {/* ================================================================ */}
      {/* HEADER & SCENARIO BAR */}
      {/* ================================================================ */}
      <div className="bg-white border border-surface-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <Breadcrumbs
              items={[
                { label: 'Onchain Insights', href: '/onchain-insights' },
                { label: 'Dependency Explorer' },
              ]}
            />
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h1 className="page-title text-2xl font-bold tracking-tight text-[#4B164C]">
                Multi-Tier Dependency & Impact Explorer
              </h1>
              <Badge className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                <Network size={11} className="text-purple-600" />
                Network Topology Graph
              </Badge>
            </div>
            <p className="page-subtitle text-xs text-text-muted">
              Interactive node-edge graph modeling: trace supplier disruptions downstream through raw materials, manufacturing facilities, finished SKUs, and exposed customer sales orders
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                refetch();
                toast.success('Dependency topology re-synchronized with ERP ledger.');
              }}
              className="btn-secondary text-xs px-3.5 py-1.5 gap-1.5"
            >
              <RefreshCw size={13} />
              Refresh Graph
            </button>
            <button
              onClick={() => {
                toast.success('Multi-tier exposure manifest exported to PDF audit pack.');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4B164C] text-white hover:bg-[#39103a] shadow-sm transition-all"
            >
              <FileText size={13} />
              Export Impact Report
            </button>
          </div>
        </div>

        {/* Quick Scenario Tracing Presets */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
          <span className="text-[11px] font-bold text-text-muted uppercase flex items-center gap-1 mr-1">
            <Sparkles size={13} className="text-amber-500" /> Quick Trace Scenarios:
          </span>
          <button
            onClick={() => applyPreset('sup-001', 'Global Timber Cyclone Outage')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
              selectedNodeId === 'sup-001'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            Trace Global Timber Cyclone Outage
          </button>
          <button
            onClick={() => applyPreset('sup-004', 'SteelCraft Blast Furnace Halt')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
              selectedNodeId === 'sup-004'
                ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
            }`}
          >
            Trace SteelCraft Blast Furnace Halt
          </button>
          <button
            onClick={() => applyPreset('sup-007', 'Precision Fixings Port Backlog')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
              selectedNodeId === 'sup-007'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            Trace Precision Bearings Port Backlog
          </button>
          <button
            onClick={() => setSelectedNodeId('')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
              !selectedNodeId
                ? 'bg-[#4B164C] text-white border-[#4B164C]'
                : 'bg-slate-50 text-text-secondary border-slate-200 hover:bg-slate-100'
            }`}
          >
            Reset Selection (Show Entire Network)
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* FILTER CONTROLS & IMPACT METRICS BAR */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Entity Type Toggle Filters */}
        <div className="lg:col-span-8 glass-card p-3 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[10px] font-bold text-text-muted uppercase mr-1 flex items-center gap-1 shrink-0">
            <Filter size={12} /> Filter Tiers:
          </span>
          {(['sub_tier', 'supplier', 'material', 'facility', 'product', 'order'] as const).map((type) => {
            const isActive = activeTypeFilters[type];
            return (
              <button
                key={type}
                onClick={() => toggleTypeFilter(type)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#4B164C] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {type === 'sub_tier'
                  ? 'Sub-Tiers'
                  : type === 'supplier'
                  ? 'Suppliers'
                  : type === 'material'
                  ? 'Materials'
                  : type === 'facility'
                  ? 'Facilities'
                  : type === 'product'
                  ? 'Products'
                  : 'Orders'}
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

          {/* Only Disrupted Toggle */}
          <button
            onClick={() => setOnlyDisruptedFilter(!onlyDisruptedFilter)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 ${
              onlyDisruptedFilter
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle size={11} /> Only Disrupted Nodes
          </button>
        </div>

        {/* Real-Time Impact Metric Strip */}
        <div className="lg:col-span-4 glass-card p-3 flex items-center justify-between text-xs">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase">Revenue at Risk (Path)</p>
            <p className="text-base font-black text-rose-700 font-mono">
              ₹{impactSummary.totalRevenueAtRiskINR.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-text-muted uppercase">Downstream Exposure</p>
            <p className="text-xs font-bold text-text-primary">
              {impactSummary.impactedProductsCount} SKUs • {impactSummary.impactedOrdersCount} Orders
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* INTERACTIVE FULL-WIDTH GRAPH CANVAS & DETAIL SIDEBAR */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* React Flow Canvas (8 cols or 9 cols) */}
        <div className="lg:col-span-8 bg-slate-50 border border-surface-border rounded-2xl overflow-hidden shadow-sm h-[640px] relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            minZoom={0.2}
            maxZoom={1.8}
            defaultViewport={{ x: 20, y: 20, zoom: 0.65 }}
          >
            <Background color="#cbd5e1" gap={20} size={1} />
            <Controls className="bg-white border border-slate-200 rounded-xl shadow-md p-1" />
            <MiniMap
              className="bg-white border border-slate-200 rounded-xl shadow-md"
              nodeColor={(node) => {
                if (node.data?.status === 'disrupted') return '#e11d48';
                if (node.data?.status === 'at_risk') return '#f59e0b';
                return '#4B164C';
              }}
            />
            {/* Legend Panel */}
            <Panel position="top-left" className="bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-xs text-[10px] space-y-1">
              <p className="font-bold text-text-muted uppercase tracking-wider">Multi-Tier Network Legend</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-slate-400"></span> Sub-Tier</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-600"></span> Supplier</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500"></span> Material</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500"></span> Facility</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500"></span> Product SKU</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500"></span> Sales Order</span>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Selected Node Detail & Downstream Impact Panel (4 cols) */}
        {selectedNode && (
          <div className="lg:col-span-4 glass-card p-5 space-y-5">
            {/* Header Identity */}
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F8E7F6] text-[#4B164C]">
                  {selectedNode.data.type.replace('_', ' ')}
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    selectedNode.data.status === 'disrupted'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : selectedNode.data.status === 'at_risk'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {selectedNode.data.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="text-base font-bold text-text-primary leading-tight">
                {selectedNode.data.label}
              </h3>
              <p className="text-xs font-mono text-text-secondary">
                {selectedNode.data.sublabel}
              </p>
            </div>

            {/* Active Disruption Banner */}
            {selectedNode.data.disruptionTitle && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <AlertTriangle size={14} className="text-rose-600" /> Active Incident Alert:
                </div>
                <p className="text-rose-900 leading-relaxed text-[11px]">
                  {selectedNode.data.disruptionTitle}
                </p>
              </div>
            )}

            {/* Downstream Path Impact Summary Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-muted uppercase text-[10px]">
                  Downstream Blast Radius
                </span>
                <span className="text-[10px] font-bold text-rose-700">
                  {impactSummary.pathNodeIds.length} Connected Nodes
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <p className="text-[9px] text-text-muted uppercase font-bold">Products Affected</p>
                  <p className="text-lg font-black text-text-primary font-mono">
                    {impactSummary.impactedProductsCount}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <p className="text-[9px] text-text-muted uppercase font-bold">Sales Orders at Risk</p>
                  <p className="text-lg font-black text-rose-600 font-mono">
                    {impactSummary.impactedOrdersCount}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-100/60 border border-rose-200 text-center space-y-0.5">
                <p className="text-[9px] text-rose-800 uppercase font-bold tracking-wider">
                  Total Downstream Revenue Exposed
                </p>
                <p className="text-xl font-black text-rose-700 font-mono">
                  ₹{impactSummary.totalRevenueAtRiskINR.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Entity Attributes Grid */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-text-muted uppercase text-[10px]">Entity Attributes:</p>
              <div className="space-y-1.5">
                {selectedNode.data.location && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-text-muted">Location:</span>
                    <span className="font-semibold text-text-primary flex items-center gap-1">
                      <MapPin size={11} /> {selectedNode.data.location}
                    </span>
                  </div>
                )}
                {selectedNode.data.leadTimeDays && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-text-muted">Lead Time:</span>
                    <span className="font-bold text-text-primary">{selectedNode.data.leadTimeDays} days</span>
                  </div>
                )}
                {selectedNode.data.stockUnits && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-text-muted">Current Ledger Stock:</span>
                    <span className="font-bold text-text-primary">{selectedNode.data.stockUnits} units</span>
                  </div>
                )}
                {selectedNode.data.sku && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-text-muted">Catalog SKU:</span>
                    <span className="font-mono font-bold text-text-primary">{selectedNode.data.sku}</span>
                  </div>
                )}
                {selectedNode.data.valueINR && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-text-muted">Order Value:</span>
                    <span className="font-bold text-[#4B164C]">₹{selectedNode.data.valueINR.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Links to Existing ERP Pages (Acceptance Criteria) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="font-bold text-text-muted uppercase text-[10px]">Connected ERP Workflows:</p>
              <div className="flex flex-col gap-2">
                {selectedNode.data.erpLink && (
                  <Link
                    href={selectedNode.data.erpLink}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-[#F8E7F6]/50 border border-slate-200 text-xs font-bold text-[#4B164C] transition-all"
                  >
                    <span>View Primary Record ({selectedNode.data.label})</span>
                    <ExternalLink size={13} />
                  </Link>
                )}

                {selectedNode.data.type === 'supplier' && (
                  <Link
                    href={`/onchain-insights/supplier-switch?current=${selectedNode.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#4B164C] text-white hover:bg-[#39103a] text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Launch Supplier Switch Simulator</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
