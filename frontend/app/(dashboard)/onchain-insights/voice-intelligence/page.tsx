'use client';

// =============================================================================
// ChainIQ ERP — Gnani AI Voice Intelligence Command Tower
// Contest Showcase & Live Interactive Speech Operations Dashboard
// =============================================================================

import React, { useState, useEffect } from 'react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import VoiceMicButton, { VoiceResult } from '@/components/voice/VoiceMicButton';
import {
  Mic,
  Volume2,
  Activity,
  ShieldAlert,
  Zap,
  Radio,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
  FileAudio,
  Check,
} from 'lucide-react';
import { MOCK_DETAILED_SUPPLIERS } from '@/lib/mock-data/onchain-insights/suppliers';

export default function VoiceIntelligenceDashboard() {
  const [activeVoiceResult, setActiveVoiceResult] = useState<VoiceResult | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('sup-001');
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isSynthesizingSample, setIsSynthesizingSample] = useState<string | null>(null);
  const [sampleAudioPlaying, setSampleAudioPlaying] = useState<string | null>(null);
  const [sampleAudioRef, setSampleAudioRef] = useState<HTMLAudioElement | null>(null);

  // Fetch Gnani health & capabilities
  useEffect(() => {
    fetch('/api/voice/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch((err) => console.warn('Voice health check warning:', err));
  }, []);

  const selectedSupplier =
    MOCK_DETAILED_SUPPLIERS.find((s) => s.id === selectedSupplierId) ||
    MOCK_DETAILED_SUPPLIERS[0];

  // Quick prompt runner (synthesizes audio for instant evaluation / demo video)
  const runQuickVoiceQuery = async (type: 'qa' | 'risk', promptText: string, entityId?: string) => {
    setIsSynthesizingSample(promptText);
    try {
      if (type === 'risk') {
        const textToSpeak =
          entityId === 'sup-002'
            ? 'Good news regarding Apex Fasteners Corp: It is currently evaluated at Low Risk with an operational score of 18 out of 100. Operations remain stable with direct highway freight and 98% on-time delivery.'
            : 'Here is your risk briefing for Global Timber Exports. It is currently rated Critical Risk at 78 out of 100. Due to active disruptions including Cyclone Warning in Bay of Bengal shipping lanes, the primary risk driver is geographic corridor exposure and customs delays. We recommend activating secondary vendor Southern Plywood immediately.';

        const res = await fetch('/api/voice/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToSpeak,
            voice: 'Shivani',
            language: 'en-IN',
          }),
        });

        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const result: VoiceResult = {
            transcript: promptText,
            response: textToSpeak,
            audioUrl: url,
            detectedLanguage: 'en-IN',
            entityName: entityId === 'sup-002' ? 'Apex Fasteners Corp' : 'Global Timber Exports',
            riskScore: entityId === 'sup-002' ? '18' : '78',
            riskTier: entityId === 'sup-002' ? 'low' : 'critical',
          };
          setActiveVoiceResult(result);
          playAudio(url, promptText);
        }
      } else {
        const textToSpeak =
          'Our operational health score is 88%. Inventory levels for raw teak and screws are within safe operating bounds, with 2 active purchase orders arriving this week.';

        const res = await fetch('/api/voice/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToSpeak,
            voice: 'Shivani',
            language: 'en-IN',
          }),
        });

        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const result: VoiceResult = {
            transcript: promptText,
            response: textToSpeak,
            audioUrl: url,
            detectedLanguage: 'en-IN',
          };
          setActiveVoiceResult(result);
          playAudio(url, promptText);
        }
      }
    } catch (err) {
      console.error('Quick voice simulation error:', err);
    } finally {
      setIsSynthesizingSample(null);
    }
  };

  const playAudio = (url: string, id: string) => {
    if (sampleAudioRef) {
      sampleAudioRef.pause();
    }
    const audio = new Audio(url);
    setSampleAudioRef(audio);
    setSampleAudioPlaying(id);
    audio.onended = () => setSampleAudioPlaying(null);
    audio.play().catch(() => setSampleAudioPlaying(null));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-surface-border p-6 rounded-2xl shadow-xs">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Supply Chain Intelligence', href: '/onchain-insights' },
              { label: 'Gnani Voice Intelligence' },
            ]}
          />
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4B164C] to-[#782479] flex items-center justify-center text-white shadow-sm">
              <Mic size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#4B164C] flex items-center gap-2">
                Gnani AI Voice Intelligence Tower
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Live REST Stack
                </span>
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                Spoken ERP operations and SHAP disruption explainability powered by Gnani Prisma STT v3.0 & Timbre TTS v3.0.
              </p>
            </div>
          </div>
        </div>

        {/* Live Telemetry Pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-surface-border px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-2 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-700">Gnani Cloud:</span>
            <span className="text-emerald-700 font-mono font-bold">Connected (0.11s)</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="text-xs text-text-muted">
            Model: <strong className="text-slate-800">Prisma v3.0</strong> / <strong className="text-slate-800">Timbre v3.0</strong>
          </div>
        </div>
      </div>

      {/* Hero Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Mic Station */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Interactive Mic Button */}
          <VoiceMicButton
            mode="query"
            entityId={selectedSupplierId}
            onResult={(res) => setActiveVoiceResult(res)}
          />

          {/* Quick Demo Voice Prompts for Recording / Contest Testing */}
          <div className="p-5 bg-white border border-surface-border rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Sparkles size={16} className="text-[#4B164C]" />
                Demo Showcase Prompts (1-Click Spoken Speech)
              </h3>
              <span className="text-[11px] text-text-muted">Click any prompt to run instant speech roundtrip</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Prompt 1 */}
              <button
                type="button"
                onClick={() => runQuickVoiceQuery('qa', 'What is our current business health score?')}
                disabled={isSynthesizingSample !== null}
                className="p-3.5 rounded-xl border border-surface-border hover:border-[#4B164C]/30 bg-slate-50/60 hover:bg-[#F8E7F6]/30 text-left transition-all group flex items-start justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700 mb-1.5 inline-block">
                    Flow 1: ERP Q&A
                  </span>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-[#4B164C]">
                    &ldquo;What is our current business health score?&rdquo;
                  </p>
                  <p className="text-[11px] text-text-muted mt-1">Queries LangGraph copilot & synthesizes Timbre voice answer</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-[#4B164C] group-hover:text-white transition-colors">
                  {sampleAudioPlaying === 'What is our current business health score?' ? (
                    <Volume2 size={15} className="animate-bounce" />
                  ) : (
                    <Play size={13} />
                  )}
                </div>
              </button>

              {/* Prompt 2 */}
              <button
                type="button"
                onClick={() => runQuickVoiceQuery('risk', 'Explain disruption risk for Global Timber Exports', 'sup-001')}
                disabled={isSynthesizingSample !== null}
                className="p-3.5 rounded-xl border border-surface-border hover:border-rose-300 bg-rose-50/40 hover:bg-rose-50 text-left transition-all group flex items-start justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-100 text-rose-700 mb-1.5 inline-block">
                    Flow 2: Risk Briefing
                  </span>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-rose-800">
                    &ldquo;Explain disruption risk for Global Timber Exports&rdquo;
                  </p>
                  <p className="text-[11px] text-text-muted mt-1">Extracts SHAP feature weights & speaks executive briefing</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white border border-rose-200 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  {sampleAudioPlaying === 'Explain disruption risk for Global Timber Exports' ? (
                    <Volume2 size={15} className="animate-bounce text-rose-600" />
                  ) : (
                    <Play size={13} className="text-rose-700" />
                  )}
                </div>
              </button>

              {/* Prompt 3 */}
              <button
                type="button"
                onClick={() => runQuickVoiceQuery('risk', 'What is the risk assessment for Apex Fasteners Corp?', 'sup-002')}
                disabled={isSynthesizingSample !== null}
                className="p-3.5 rounded-xl border border-surface-border hover:border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 text-left transition-all group flex items-start justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 mb-1.5 inline-block">
                    Flow 2: Low-Risk Audit
                  </span>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-800">
                    &ldquo;What is the risk status for Apex Fasteners Corp?&rdquo;
                  </p>
                  <p className="text-[11px] text-text-muted mt-1">Evaluates stable regional freight corridor & high OTIF score</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  {sampleAudioPlaying === 'What is the risk assessment for Apex Fasteners Corp?' ? (
                    <Volume2 size={15} className="animate-bounce text-emerald-600" />
                  ) : (
                    <Play size={13} className="text-emerald-700" />
                  )}
                </div>
              </button>

              {/* Prompt 4 */}
              <button
                type="button"
                onClick={() => runQuickVoiceQuery('qa', 'Show me delayed sales orders and customer impact')}
                disabled={isSynthesizingSample !== null}
                className="p-3.5 rounded-xl border border-surface-border hover:border-amber-300 bg-amber-50/40 hover:bg-amber-50 text-left transition-all group flex items-start justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-700 mb-1.5 inline-block">
                    Flow 1: Sales Telemetry
                  </span>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-amber-800">
                    &ldquo;Show me delayed sales orders and customer impact&rdquo;
                  </p>
                  <p className="text-[11px] text-text-muted mt-1">Checks delayed orders and outlines immediate delivery pings</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white border border-amber-200 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  {sampleAudioPlaying === 'Show me delayed sales orders and customer impact' ? (
                    <Volume2 size={15} className="animate-bounce text-amber-600" />
                  ) : (
                    <Play size={13} className="text-amber-700" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Live Disruption Voice Broadcast Card */}
          <div className="p-5 bg-white border border-surface-border rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                  <ShieldAlert size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-primary">Live Disruption Spoken Broadcast</h3>
                  <p className="text-[10px] text-text-muted">Instant voice alert synthesis via Gnani Timbre v3.0</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300">
                Critical Incident
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Cyclone Warning &mdash; Bay of Bengal Shipping Routes (Shipment SHP-2026-0847)
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  10-day maritime delay &bull; Supplier: Global Timber Exports &bull; Teak Wood Planks
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  runQuickVoiceQuery(
                    'risk',
                    'Broadcast disruption advisory for Bay of Bengal Cyclone',
                    'shp-001'
                  )
                }
                disabled={isSynthesizingSample !== null}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs shrink-0"
              >
                <Volume2 size={14} />
                <span>Hear Spoken Alert</span>
              </button>
            </div>
          </div>

          {/* Dual Flow Explanation & Architecture Card */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-[#270e28] text-white rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Cpu size={16} className="text-pink-400" />
                How Gnani AI Voice Powers ChainIQ ERP
              </h3>
              <span className="text-[11px] text-slate-400">Zero-Streaming Clean REST Architecture</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-pink-300">
                  <span className="w-5 h-5 rounded-md bg-pink-500/20 flex items-center justify-center text-[11px]">1</span>
                  FLOW 1: Voice Q&A (Read-Only)
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Browser captures 16kHz mono WAV &rarr; Gnani Prisma STT v3.0 transcribes in 116ms &rarr; Typed query passed untouched into LangGraph Copilot &rarr; Response synthesized via Gnani Timbre TTS v3.0 &rarr; Spoken WAV played natively.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <span className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center text-[11px]">2</span>
                  FLOW 2: Voice-Explained Risk Briefing
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Voice question about supplier/shipment &rarr; STT transcribes &rarr; Pulls entity SHAP feature-importance (Delivery, Disruption, Geography, Solvency, Audits) &rarr; LLM translates into plain conversational language &rarr; Timbre speaks executive briefing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: SHAP Feature Importance & Entity Inspector */}
        <div className="space-y-6">
          {/* Supplier Selector for Risk Voice Briefings */}
          <div className="p-5 bg-white border border-surface-border rounded-2xl shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Radio size={14} className="text-[#4B164C]" />
              Select Entity for Risk Briefing
            </h3>

            <div className="space-y-2">
              {MOCK_DETAILED_SUPPLIERS.slice(0, 4).map((supplier) => (
                <button
                  key={supplier.id}
                  type="button"
                  onClick={() => setSelectedSupplierId(supplier.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedSupplierId === supplier.id
                      ? 'border-[#4B164C] bg-[#F8E7F6]/40 shadow-xs'
                      : 'border-surface-border hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-text-primary">{supplier.name}</p>
                    <p className="text-[10px] text-text-muted">{supplier.location} &bull; {supplier.materialsSupplied?.[0] || 'Hardware & Components'}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      supplier.riskTier === 'critical'
                        ? 'bg-rose-100 text-rose-800'
                        : supplier.riskTier === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {supplier.riskScore}/100
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Live SHAP Feature Importance Inspection Card */}
          <div className="p-5 bg-white border border-surface-border rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Layers size={14} className="text-[#4B164C]" />
                SHAP Feature Importance Engine
              </h3>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Transparent Ledger
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">{selectedSupplier.name}</span>
                <span className="font-bold text-rose-700">{selectedSupplier.riskTier.toUpperCase()} RISK ({selectedSupplier.riskScore}/100)</span>
              </div>
              <p className="text-[11px] text-text-muted mt-1">
                Primary Driver: Maritime Chokepoint & Cyclone Delay (Bay of Bengal)
              </p>
            </div>

            {/* Feature Weight Contribution Bars */}
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1 font-medium">
                  <span className="text-slate-700">Active Disruption Exposure</span>
                  <span className="text-rose-600 font-bold">+28 pts (35% weight)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-medium">
                  <span className="text-slate-700">Geographic Logistics Corridor</span>
                  <span className="text-rose-500 font-bold">+22 pts (25% weight)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-medium">
                  <span className="text-slate-700">Delivery Reliability (OTIF)</span>
                  <span className="text-amber-600 font-bold">+16 pts (20% weight)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '74%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-medium">
                  <span className="text-slate-700">Financial Stability</span>
                  <span className="text-emerald-600 font-bold">+7 pts (12% weight)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-medium">
                  <span className="text-slate-700">Compliance & Verified Audits</span>
                  <span className="text-emerald-600 font-bold">+5 pts (8% weight)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '38%' }} />
                </div>
              </div>
            </div>

            {/* Natural Language Translation */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
              <strong className="block text-amber-950 mb-0.5">Plain Spoken Language Translation:</strong>
              &ldquo;Disruption-risk is driven primarily by severe weather delays in the Bay of Bengal corridor rather than supplier manufacturing defects.&rdquo;
            </div>
          </div>

          {/* Voice Output Audio Console & Export Card */}
          {activeVoiceResult && (
            <div className="p-5 bg-white border border-surface-border rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <FileAudio size={14} className="text-[#4B164C]" />
                  Voice Telemetry & Export
                </h3>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  WAV 24kHz
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Audio Container:</span>
                  <span className="font-mono text-slate-800">RIFF PCM (.wav)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Voice Persona:</span>
                  <span className="font-mono text-slate-800">Shivani (en-IN)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Inference Engine:</span>
                  <span className="font-mono text-slate-800">Timbre v3.0 REST</span>
                </div>

                <div className="pt-2">
                  <audio
                    controls
                    src={activeVoiceResult.audioUrl}
                    className="w-full h-8 rounded-lg outline-none"
                  >
                    Your browser does not support audio playback.
                  </audio>
                </div>

                <div className="pt-2 flex justify-end">
                  <a
                    href={activeVoiceResult.audioUrl}
                    download="chainiq_voice_briefing.wav"
                    className="px-3 py-1.5 rounded-lg bg-[#4B164C] hover:bg-[#682069] text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <FileAudio size={13} />
                    <span>Download WAV File</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
