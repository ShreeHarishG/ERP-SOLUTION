'use client';

// =============================================================================
// Autonomous Control Tower — 14 AI Models Catalog & Unified Webhook Hub
// Complete implementation of Agent I/O Specification v1.0 (October 21, 2026)
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  CONTROL_TOWER_AGENTS,
  INITIAL_COMMON_EVENT,
} from '@/lib/mock-data/control-tower-agents';
import { AgentDefinition, ControlTowerConfig } from '@/types/control-tower-agents';
import AgentDetailSheet from '@/components/control-tower/AgentDetailSheet';
import AutonomousScenarioPlayer from '@/components/control-tower/AutonomousScenarioPlayer';
import {
  Cpu,
  Layers,
  Radio,
  Share2,
  Settings,
  ShieldCheck,
  Search,
  ExternalLink,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Lock,
  Globe,
  FileCode,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export default function ControlTowerAgentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State
  const [selectedAgent, setSelectedAgent] = useState<AgentDefinition | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'scenario' | 'webhook_health'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Admin Stealth Configuration Modal
  const [showAdminConfig, setShowAdminConfig] = useState(false);
  const [config, setConfig] = useState<ControlTowerConfig>({
    mode: 'mock',
    webhookUrl: '',
    webhookSecret: '',
    outgoingCallbackUrl: '',
    simulateLatency: true,
  });
  const [pingResult, setPingResult] = useState<{
    status: string;
    latencyMs: number;
    message: string;
  } | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Fetch initial config & telemetry
  useEffect(() => {
    fetch('/api/control-tower/config')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setConfig({
            mode: data.mode || 'mock',
            webhookUrl: data.hasWebhook ? 'configured' : '',
            webhookSecret: '',
            outgoingCallbackUrl: data.hasOutgoingCallback ? 'configured' : '',
            simulateLatency: data.simulateLatency ?? true,
            lastHealthCheck: data.lastHealthCheck,
          });
        }
      })
      .catch((err) => console.error('Failed to load control tower config:', err));
  }, []);

  const handleOpenSheet = (agent: AgentDefinition) => {
    setSelectedAgent(agent);
    setIsSheetOpen(true);
  };

  const handleSelectAgentById = (id: number) => {
    const found = CONTROL_TOWER_AGENTS.find((a) => a.id === id);
    if (found) {
      setSelectedAgent(found);
      setIsSheetOpen(true);
    }
  };

  const handlePing = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const res = await fetch('/api/control-tower/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setPingResult(data);
    } catch (err: any) {
      setPingResult({
        status: 'offline',
        latencyMs: 0,
        message: err.message || 'Ping failed',
      });
    } finally {
      setIsPinging(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/control-tower/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: config.mode }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowAdminConfig(false);
      } else {
        alert(data.error || 'Failed to save config');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Filter Agents
  const filteredAgents = CONTROL_TOWER_AGENTS.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.investorPitch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || a.type === selectedType;
    return matchesSearch && matchesType;
  });

  const uniqueTypes = Array.from(new Set(CONTROL_TOWER_AGENTS.map((a) => a.type)));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Autonomous Supply Chain Control Tower
            </span>
            <span className="text-xs text-slate-500 font-mono">I/O Specification v1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-8 h-8 text-emerald-600" />
            AI Models & Webhook Control Tower
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            A cohesive network of 14 specialized agents communicating via a shared incident event contract. Ingests all model signals through a unified single webhook gateway with instant mock simulation fallback.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Stealth Admin Settings Trigger */}
          {isAdmin && (
            <button
              onClick={() => setShowAdminConfig(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
              title="Stealth Gateway Settings (Admin Only)"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              <span>Gateway Settings</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  config.mode === 'webhook' ? 'bg-purple-400 animate-ping' : 'bg-emerald-400'
                }`}
              />
            </button>
          )}

          <button
            onClick={() => handleOpenSheet(CONTROL_TOWER_AGENTS[0])}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Play className="w-4 h-4 fill-white" /> Quick Test Webhook
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Specialized Agents</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">14 Models</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Pipeline Coverage
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Event Contract</span>
            <FileCode className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">EVT-1001</div>
          <div className="text-[11px] text-slate-500">Shared Inter-Agent Schema</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Unified Webhook</span>
            <Share2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                config.mode === 'webhook' ? 'bg-purple-500' : 'bg-emerald-500'
              }`}
            />
            {config.mode === 'webhook' ? 'Live Gateway' : 'Simulated'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono truncate">
            /api/control-tower/webhook
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Mean Response Time</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">~95ms</div>
          <div className="text-[11px] text-slate-500">Sub-second C-Suite Insights</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'catalog'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          14 AI Models Catalog & Input/Output
        </button>

        <button
          onClick={() => setActiveTab('scenario')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'scenario'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Live Incident Scenario Demo (Section 6)
        </button>

        <button
          onClick={() => setActiveTab('webhook_health')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'webhook_health'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          Webhook Health & Investor Explainer
        </button>
      </div>

      {/* Tab 1: AI Models Showcase Table */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search models, investor keywords, algorithms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder-slate-400 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Filter Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="all">All Agent Architectures (14)</option>
                {uniqueTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Models Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">Model & Architecture</th>
                    <th className="py-3.5 px-4 min-w-[260px]">Investor Value (Small & Sweet)</th>
                    <th className="py-3.5 px-4 min-w-[180px]">Input Feeds</th>
                    <th className="py-3.5 px-4 min-w-[180px]">Output Deliverable</th>
                    <th className="py-3.5 px-4 text-center">Confidence</th>
                    <th className="py-3.5 px-4 text-right">Inspect Sheet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAgents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => handleOpenSheet(agent)}
                    >
                      {/* Column 1: Number */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-400">
                        #{agent.id}
                      </td>

                      {/* Column 2: Model & Architecture */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {agent.name}
                        </div>
                        <div className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {agent.type}
                        </div>
                      </td>

                      {/* Column 3: Investor Value */}
                      <td className="py-4 px-4 text-slate-600 leading-relaxed text-[11px]">
                        <span className="font-semibold text-slate-800">
                          &ldquo;{agent.investorPitch}&rdquo;
                        </span>
                      </td>

                      {/* Column 4: Input Feeds */}
                      <td className="py-4 px-4 text-slate-500 text-[11px]">
                        <div className="line-clamp-2" title={agent.inputsDescription}>
                          {agent.inputsDescription}
                        </div>
                      </td>

                      {/* Column 5: Output Deliverable */}
                      <td className="py-4 px-4 text-slate-500 text-[11px]">
                        <div className="line-clamp-2" title={agent.outputsDescription}>
                          {agent.outputsDescription}
                        </div>
                      </td>

                      {/* Column 6: Confidence */}
                      <td className="py-4 px-4 text-center font-mono">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {(agent.accuracyConfidence * 100).toFixed(0)}%
                        </span>
                      </td>

                      {/* Column 7: Action Button to Open Sheet */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSheet(agent);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Open Sheet</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Incident Scenario Demo */}
      {activeTab === 'scenario' && (
        <AutonomousScenarioPlayer onSelectAgent={handleSelectAgentById} />
      )}

      {/* Tab 3: Webhook Health & Investor Explainer */}
      {activeTab === 'webhook_health' && (
        <div className="space-y-6">
          {/* Investor Architecture Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Investor Thesis & Core Architecture
              </span>
            </div>
            <h3 className="text-2xl font-black tracking-tight">
              Why ChainIQ is an Autonomous Control Tower, NOT 14 Disconnected AI Chatbots
            </h3>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Traditional enterprise AI deployments create siloed, hallucination-prone chatbots that require manual prompting. In contrast, ChainIQ’s Control Tower is a deterministic, event-driven state machine governed by three unbreakable principles:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h4 className="text-sm font-bold text-white">Unified Shared Event Contract</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every agent communicates via a shared incident object (<code className="text-emerald-300">EVT-1001</code>). Agents enrich the single event rather than passing unstructured free text.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h4 className="text-sm font-bold text-white">Strict Human-in-the-Loop Gate</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Agent #8 (Auto Procurement) drafts purchase orders in <code className="text-blue-300">PENDING_APPROVAL</code>. The system never commits capital without explicit human authorization.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h4 className="text-sm font-bold text-white">Closed-Loop Algorithmic Learning</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Agent #14 (Post-Mortem) compares predicted delay vs actual outcome, computing exact revenue saved ($1M) and automatically fine-tuning Agent #5’s disruption weights.
                </p>
              </div>
            </div>
          </div>

          {/* Webhook Health Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Single Gateway Webhook Health & Ingestion Probe
                </h4>
                <p className="text-xs text-slate-500">
                  Monitors the health of the single all-in-one webhook endpoint used by all 14 models.
                </p>
              </div>

              <button
                onClick={handlePing}
                disabled={isPinging}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              >
                <Activity className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
                {isPinging ? 'Pinging Gateway...' : 'Ping Webhook Health'}
              </button>
            </div>

            {pingResult && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
                  pingResult.status === 'healthy'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : pingResult.status === 'degraded'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {pingResult.status === 'healthy' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  )}
                  <span>{pingResult.message}</span>
                </div>
                <div className="font-mono text-[11px] font-bold">
                  {pingResult.latencyMs}ms Latency
                </div>
              </div>
            )}

            {/* Ingestion & Outgoing Endpoint Specification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Ingestion Webhook (Input)
                </span>
                <div className="font-mono text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
                  POST /api/control-tower/webhook
                </div>
                <p className="text-[11px] text-slate-500">
                  Accepts payloads for all 14 agents with optional auto-agent detection.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Outgoing Webhook Callback (Output)
                </span>
                <div className="font-mono text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 truncate">
                  {config.outgoingCallbackUrl || 'Configurable per request (callback_url)'}
                </div>
                <p className="text-[11px] text-slate-500">
                  Dispatches enriched incident responses to external endpoints automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-Over Sheet for Deep Dive & Testing */}
      <AgentDetailSheet
        agent={selectedAgent}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSelectAgent={handleSelectAgentById}
      />

      {/* Stealth Admin Configuration Modal */}
      {showAdminConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Control Tower Stealth Configuration
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Visible exclusively to Admins. Seamlessly toggle live webhook vs mock demo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminConfig(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Execution Mode</div>
                  <div className="text-[11px] text-slate-500">
                    Switch between single external webhook or built-in mock simulation.
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setConfig({ ...config, mode: 'mock' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      config.mode === 'mock'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Mock Simulation
                  </button>
                  <button
                    onClick={() => setConfig({ ...config, mode: 'webhook' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      config.mode === 'webhook'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Single Webhook
                  </button>
                </div>
              </div>

              {config.mode === 'mock' && (
                <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>
                    <strong>Stealth Mock Active:</strong> The UI responds identically to live models using official spec data. External viewers will experience zero latency hiccups.
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-700">Environment-managed endpoints</p>
              <p className="text-[11px] text-slate-500">
                Webhook URL, secret, and outgoing callback are read from server env only.
                The admin UI can toggle mock vs webhook mode.
              </p>
              <p className="text-[11px] font-mono text-slate-600">
                Ingestion webhook: {config.webhookUrl ? 'configured' : 'not set'}
              </p>
              <p className="text-[11px] font-mono text-slate-600">
                Outgoing callback: {config.outgoingCallbackUrl ? 'configured' : 'not set'}
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                onClick={handlePing}
                disabled={isPinging || !config.webhookUrl}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" /> Test Webhook Ping
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAdminConfig(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={isSavingConfig}
                  className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl shadow-md transition-all"
                >
                  {isSavingConfig ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
