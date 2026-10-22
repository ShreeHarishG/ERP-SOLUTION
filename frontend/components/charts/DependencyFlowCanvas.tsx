'use client';

import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  type NodeProps,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  AlertTriangle,
  Building2,
  Package,
  ShoppingCart,
  Warehouse,
  Factory,
  Layers,
} from 'lucide-react';
import type {
  DependencyNodeType,
  DependencyNodeData,
} from '@/types/onchain-insights';

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

interface DependencyFlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
}

export default function DependencyFlowCanvas({
  nodes,
  edges,
  onNodeClick,
}: DependencyFlowCanvasProps) {
  return (
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
        <Panel
          position="top-left"
          className="bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-xs text-[10px] space-y-1"
        >
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
  );
}
