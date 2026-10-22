'use client';

// =============================================================================
// AutonomousScenarioPlayer — Interactive End-to-End Control Tower Scenario
// Based on Section 6 of Specification: Demonstrates one incident flowing through all agents
// =============================================================================

import React, { useState, useEffect } from 'react';
import { END_TO_END_SCENARIO_STEPS, ScenarioStep } from '@/lib/mock-data/control-tower-agents';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export default function AutonomousScenarioPlayer({
  onSelectAgent,
}: {
  onSelectAgent: (agentId: number) => void;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [humanApproved, setHumanApproved] = useState(false);

  const currentStep: ScenarioStep = END_TO_END_SCENARIO_STEPS[currentStepIndex];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      // Pause at step 8 if human hasn't approved yet
      if (currentStepIndex === 7 && !humanApproved) {
        setIsPlaying(false);
        return;
      }

      timer = setTimeout(() => {
        if (currentStepIndex < END_TO_END_SCENARIO_STEPS.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, humanApproved]);

  const handleNext = () => {
    if (currentStepIndex === 7 && !humanApproved) {
      return; // Must approve first
    }
    if (currentStepIndex < END_TO_END_SCENARIO_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setHumanApproved(false);
  };

  const handleApprovePO = () => {
    setHumanApproved(true);
    setCurrentStepIndex(8); // Move to Step 9 (index 8)
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6">
      {/* Top Banner & Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              End-to-End Orchestration Demo
            </span>
            <span className="text-xs text-slate-400">Section 6 Architecture Flow</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Autonomous Incident Life-Cycle Simulation
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Watch how a Tier-3 raw material disruption in Shanghai flows dynamically through all 14 agents — from port congestion telemetry to $1.25M impact mitigation and human-approved PO generation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" /> Pause Demo
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Auto-Play Incident
              </>
            )}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIndex === END_TO_END_SCENARIO_STEPS.length - 1 || (currentStepIndex === 7 && !humanApproved)}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            Next Step <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 13-Step Visual Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            Step {currentStep.step} of {END_TO_END_SCENARIO_STEPS.length}
          </span>
          <span className="text-emerald-400 font-semibold">
            {Math.round(((currentStepIndex + 1) / END_TO_END_SCENARIO_STEPS.length) * 100)}% Incident Resolution
          </span>
        </div>
        <div className="grid grid-cols-13 gap-1 h-2 rounded-full overflow-hidden bg-slate-800 p-0.5">
          {END_TO_END_SCENARIO_STEPS.map((s, idx) => (
            <div
              key={s.step}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-full rounded-sm cursor-pointer transition-all duration-300 ${
                idx === currentStepIndex
                  ? 'bg-emerald-400 shadow-md shadow-emerald-400/50'
                  : idx < currentStepIndex
                  ? 'bg-emerald-700'
                  : 'bg-slate-700/60 hover:bg-slate-700'
              }`}
              title={`Step ${s.step}: ${s.title}`}
            />
          ))}
        </div>
      </div>

      {/* Step Card Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Step Details */}
        <div className="lg:col-span-2 bg-slate-950/80 rounded-2xl p-6 border border-slate-800/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                {currentStep.step}
              </span>
              <button
                onClick={() => onSelectAgent(currentStep.agentId)}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline decoration-emerald-500/30 flex items-center gap-1"
              >
                Agent #{currentStep.agentId}: {currentStep.agentName}
              </button>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {currentStep.badge}
            </span>
          </div>

          <div>
            <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {currentStep.title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              {currentStep.description}
            </p>
          </div>

          {/* Key Metric Highlight */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                {currentStep.highlightKey}
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white font-mono">
                {currentStep.highlightValue}
              </div>
            </div>
            <button
              onClick={() => onSelectAgent(currentStep.agentId)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 border border-slate-700 flex items-center gap-1 font-semibold transition-colors"
            >
              Inspect Agent Sheet <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Human-in-the-Loop Gate at Step 8 */}
          {currentStepIndex === 7 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3 animate-pulse">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div className="text-xs font-bold text-white">
                  Governance Principle: Human Authorization Gate
                </div>
              </div>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                As required by enterprise governance, autonomous agents NEVER dispatch purchase orders without explicit authorization. Review the 15,000 unit order for Supplier SUP-045 and authorize release.
              </p>
              <button
                onClick={handleApprovePO}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Check className="w-4 h-4" /> Authorize & Release PO-2026-9981
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Live Context Event Payload */}
        <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800/80 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Event State Machine
              </span>
              <span className="font-mono text-[10px] text-emerald-400">EVT-1001</span>
            </div>
            <pre className="font-mono text-[11px] bg-slate-900 text-sky-300 p-3.5 rounded-xl border border-slate-800 overflow-x-auto max-h-48">
              {JSON.stringify(currentStep.payload, null, 2)}
            </pre>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Next Downstream:</span>
              <span className="text-slate-200 font-semibold font-mono">
                {currentStepIndex < END_TO_END_SCENARIO_STEPS.length - 1
                  ? `Agent #${END_TO_END_SCENARIO_STEPS[currentStepIndex + 1].agentId}`
                  : 'Incident Closed'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Risk Status:</span>
              <span
                className={`font-semibold ${
                  currentStepIndex >= 8 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {currentStepIndex >= 12
                  ? 'MITIGATED & LEARNED'
                  : currentStepIndex >= 8
                  ? 'MITIGATION IN PROGRESS'
                  : 'CRITICAL THREAT'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
