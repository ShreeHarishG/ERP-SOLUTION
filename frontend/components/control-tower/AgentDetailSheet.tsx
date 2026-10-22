'use client';

// =============================================================================
// AgentDetailSheet — Deep-Dive Slide-Over Drawer for Control Tower AI Models
// Allows interactive testing via Unified Webhook or Mock Simulation Engine
// =============================================================================

import React, { useState, useEffect } from 'react';
import { AgentDefinition, CommonIncidentEvent, UnifiedWebhookResponse } from '@/types/control-tower-agents';
import { INITIAL_COMMON_EVENT } from '@/lib/mock-data/control-tower-agents';
import {
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Share2,
  ShieldAlert,
} from 'lucide-react';

interface AgentDetailSheetProps {
  agent: AgentDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectAgent: (agentId: number) => void;
}

export default function AgentDetailSheet({
  agent,
  isOpen,
  onClose,
  onSelectAgent,
}: AgentDetailSheetProps) {
  const [inputJson, setInputJson] = useState<string>('');
  const [eventJson, setEventJson] = useState<string>('');
  const [callbackUrl, setCallbackUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'input' | 'contract' | 'output'>('input');
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<UnifiedWebhookResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (agent) {
      setInputJson(JSON.stringify(agent.sampleInput, null, 2));
      setEventJson(JSON.stringify(INITIAL_COMMON_EVENT, null, 2));
      setTestResult(null);
      setErrorMsg(null);
      setActiveTab('input');
    }
  }, [agent]);

  if (!isOpen || !agent) return null;

  const handleRunWebhook = async () => {
    setIsRunning(true);
    setErrorMsg(null);
    try {
      let parsedPayload = {};
      let parsedEvent = {};

      try {
        parsedPayload = JSON.parse(inputJson);
      } catch {
        throw new Error('Invalid JSON format in Agent Payload.');
      }

      try {
        parsedEvent = JSON.parse(eventJson);
      } catch {
        throw new Error('Invalid JSON format in Shared Event Contract.');
      }

      const res = await fetch('/api/control-tower/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agent.id,
          payload: parsedPayload,
          event: parsedEvent,
          callback_url: callbackUrl || undefined,
        }),
      });

      const data = (await res.json()) as UnifiedWebhookResponse;
      if (!res.ok && !data.agent_output) {
        throw new Error(data.error || 'Failed to execute webhook call');
      }

      setTestResult(data);
      setActiveTab('output');
    } catch (err: any) {
      setErrorMsg(err.message || 'Execution error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Agent #{agent.id}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {agent.type}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Zap className="w-3 h-3 text-amber-400" /> {agent.latencyMs}ms avg
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                {agent.name}
              </h2>
              <p className="text-xs text-slate-300 italic pt-1 leading-relaxed">
                &ldquo;{agent.investorPitch}&rdquo;
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Summary Pill Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-700">Confidence:</span>{' '}
              <span className="font-mono text-emerald-600 font-bold">
                {(agent.accuracyConfidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Downstream:</span>
              <div className="flex items-center gap-1">
                {agent.downstream.length === 0 ? (
                  <span className="text-slate-400">Presentation Layer</span>
                ) : (
                  agent.downstream.map((dId) => (
                    <button
                      key={dId}
                      onClick={() => onSelectAgent(dId)}
                      className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                      title={`Jump to Agent ${dId}`}
                    >
                      #{dId}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 px-6 bg-white">
            <button
              onClick={() => setActiveTab('input')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'input'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Agent Input Payload
            </button>
            <button
              onClick={() => setActiveTab('contract')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'contract'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Shared Event Object
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'output'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Webhook Output
              {testResult && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Purpose & Value Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600" /> Model Purpose & Business Value
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">{agent.purpose}</p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-slate-600 border-t border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">Primary Inputs:</span>{' '}
                  {agent.inputsDescription}
                </div>
                <div>
                  <span className="font-bold text-slate-800">Enriched Outputs:</span>{' '}
                  {agent.outputsDescription}
                </div>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tab 1: Input Payload Editor */}
            {activeTab === 'input' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Input JSON (Pre-loaded with Specification v1.0 Example)
                  </label>
                  <button
                    onClick={() => setInputJson(JSON.stringify(agent.sampleInput, null, 2))}
                    className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset to Spec
                  </button>
                </div>
                <textarea
                  value={inputJson}
                  onChange={(e) => setInputJson(e.target.value)}
                  rows={10}
                  className="w-full font-mono text-xs bg-slate-900 text-emerald-400 p-4 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                />

                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <Share2 className="w-3 h-3 text-indigo-500" /> Outgoing Webhook Callback URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://webhook.site/your-unique-id or your API endpoint"
                    value={callbackUrl}
                    onChange={(e) => setCallbackUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-700"
                  />
                  <p className="text-[10px] text-slate-400">
                    If set, the processed agent output will also be delivered asynchronously to this URL.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Shared Event Contract */}
            {activeTab === 'contract' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Inter-Agent Contract (Common Event Schema)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Every agent reads and enriches this single event rather than passing unstructured text.
                    </p>
                  </div>
                  <button
                    onClick={() => setEventJson(JSON.stringify(INITIAL_COMMON_EVENT, null, 2))}
                    className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Event
                  </button>
                </div>
                <textarea
                  value={eventJson}
                  onChange={(e) => setEventJson(e.target.value)}
                  rows={12}
                  className="w-full font-mono text-xs bg-slate-950 text-sky-400 p-4 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
                />
              </div>
            )}

            {/* Tab 3: Webhook Output */}
            {activeTab === 'output' && (
              <div className="space-y-4">
                {testResult ? (
                  <div className="space-y-4 animate-in fade-in">
                    {/* Execution Meta Bar */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold text-slate-800">
                          Execution Mode:
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            testResult.mode === 'live_webhook'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {testResult.mode === 'live_webhook' ? 'LIVE WEBHOOK' : 'SIMULATED ML CORE'}
                        </span>
                      </div>
                      <div className="font-mono text-slate-600">
                        Latency: <span className="font-bold text-slate-800">{testResult.latency_ms}ms</span>
                      </div>
                    </div>

                    {/* Outgoing Webhook Status */}
                    {testResult.callback_status && (
                      <div
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                          testResult.callback_status.delivered
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Share2 className="w-4 h-4" />
                          <span>
                            Outgoing Webhook Callback:{' '}
                            <strong>
                              {testResult.callback_status.delivered ? 'Delivered' : 'Failed / Pending'}
                            </strong>
                          </span>
                        </div>
                        <span className="font-mono text-[11px]">
                          HTTP {testResult.callback_status.status_code || 0}
                        </span>
                      </div>
                    )}

                    {/* Agent Output Payload */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          Agent Specific Output
                        </label>
                        <button
                          onClick={() => handleCopy(JSON.stringify(testResult.agent_output, null, 2))}
                          className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                        >
                          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'Copied' : 'Copy Output JSON'}
                        </button>
                      </div>
                      <pre className="font-mono text-xs bg-slate-900 text-emerald-300 p-4 rounded-xl border border-slate-700 overflow-x-auto max-h-60 shadow-inner">
                        {JSON.stringify(testResult.agent_output, null, 2)}
                      </pre>
                    </div>

                    {/* Enriched Shared Event */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">
                        Enriched Common Incident Event (Downstream Contract)
                      </label>
                      <pre className="font-mono text-xs bg-slate-950 text-sky-300 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-60 shadow-inner">
                        {JSON.stringify(testResult.enriched_event, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                      <Play className="w-6 h-6 ml-0.5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-700">No Execution Yet</h4>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Click &ldquo;Execute Model via Webhook&rdquo; below to send the payload to the single Control Tower webhook and view live enriched output.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {agent.id > 1 && (
                <button
                  onClick={() => onSelectAgent(agent.id - 1)}
                  className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                  title="Previous Agent"
                >
                  <ArrowLeft className="w-4 h-4" /> Agent #{agent.id - 1}
                </button>
              )}
              {agent.id < 14 && (
                <button
                  onClick={() => onSelectAgent(agent.id + 1)}
                  className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                  title="Next Agent"
                >
                  Agent #{agent.id + 1} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close Sheet
              </button>
              <button
                onClick={handleRunWebhook}
                disabled={isRunning}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Execute Model via Webhook
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
